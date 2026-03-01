import { useState } from 'react';
import { updatePanel } from '../services/api';

const MOCK_PANELS = [
    { qr_code_id: 'QR-P-2x1-001', panel_type: 'P-2x1', current_location: 'Floor_1_Zone_A', health_status: 'Excellent', use_count: 5 },
    { qr_code_id: 'QR-P-1x1-015', panel_type: 'P-1x1', current_location: 'Floor_1_Zone_B', health_status: 'Good', use_count: 12 },
    { qr_code_id: 'QR-P-0.5x1-008', panel_type: 'P-0.5x1', current_location: 'Yard', health_status: 'Excellent', use_count: 3 },
    { qr_code_id: 'QR-P-2x1-022', panel_type: 'P-2x1', current_location: 'Floor_2_Zone_A', health_status: 'Needs_Repair', use_count: 18 },
];

export default function ScanPage() {
    const [scanning, setScanning] = useState(false);
    const [scannedPanel, setScannedPanel] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [result, setResult] = useState(null);
    const [alert, setAlert] = useState(null);
    const [saving, setSaving] = useState(false);

    const simulateScan = () => {
        setScanning(true);
        setResult(null);
        setAlert(null);
        setNewStatus('');
        setNewLocation('');
        setTimeout(() => {
            const panel = MOCK_PANELS[Math.floor(Math.random() * MOCK_PANELS.length)];
            setScannedPanel(panel);
            setNewLocation(panel.current_location);
            setNewStatus(panel.health_status);
            setScanning(false);
        }, 1800);
    };

    const handleUpdate = async () => {
        if (!scannedPanel) return;
        setSaving(true);
        try {
            const res = await updatePanel(scannedPanel.qr_code_id, {
                health_status: newStatus,
                current_location: newLocation
            });
            setResult('✅ Panel updated successfully!');
            setAlert(res.data?.alert);
            setScannedPanel(prev => ({ ...prev, health_status: newStatus, current_location: newLocation }));
        } catch (err) {
            setResult(`❌ Update failed: ${err.message || 'Server may not be running'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <h1>QR Scanner Simulation</h1>
                <p>Simulate scanning a formwork panel's QR code to update its health status and location.</p>
            </div>

            {/* Scanner */}
            <div className="card fade-up fade-up-1" style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                    width: 200, height: 200, border: `3px solid ${scanning ? 'var(--blue)' : 'var(--border)'}`,
                    borderRadius: 16, margin: '0 auto 24px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '4rem', position: 'relative',
                    transition: 'border-color var(--transition)',
                    background: scanning ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)'
                }}>
                    {scanning ? (
                        <div>
                            <div className="spinner" />
                            <p style={{ position: 'absolute', bottom: 12, left: 0, right: 0, fontSize: '0.75rem', color: 'var(--blue-light)', margin: 0 }}>
                                Scanning...
                            </p>
                        </div>
                    ) : scannedPanel ? '✅' : '📱'}
                    {!scanning && !scannedPanel && (
                        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Press to scan
                        </div>
                    )}
                </div>

                <button className="btn btn-primary" onClick={simulateScan} disabled={scanning} style={{ width: '100%', justifyContent: 'center' }}>
                    {scanning ? '⏳ Scanning QR Code...' : '📷 Simulate QR Scan'}
                </button>
            </div>

            {/* Scanned panel details */}
            {scannedPanel && (
                <div className="card fade-up" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Panel Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                        {[
                            { label: 'QR Code', value: scannedPanel.qr_code_id },
                            { label: 'Panel Type', value: scannedPanel.panel_type },
                            { label: 'Use Count', value: `${scannedPanel.use_count}/50` },
                            { label: 'Current Status', value: scannedPanel.health_status }
                        ].map((info, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{info.label}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{info.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Update form */}
                    <hr className="divider" />
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Update After Inspection</h4>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                            Health Status
                        </label>
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                            style={{
                                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                                fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none'
                            }}>
                            {['Excellent', 'Good', 'Needs_Repair', 'Scrap'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                            Current Location
                        </label>
                        <input value={newLocation} onChange={e => setNewLocation(e.target.value)}
                            style={{
                                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                                fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                            }} />
                    </div>

                    <button className={`btn ${newStatus === 'Scrap' ? 'btn-danger' : 'btn-success'}`}
                        style={{ width: '100%', justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
                        onClick={handleUpdate} disabled={saving}>
                        {saving ? 'Saving...' : `💾 Update Panel Status`}
                    </button>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className={`alert ${result.startsWith('✅') ? 'alert-info' : 'alert-critical'} fade-up`}>
                    <span>{result.startsWith('✅') ? 'ℹ️' : '❌'}</span>
                    <div style={{ fontSize: '0.875rem' }}>{result}</div>
                </div>
            )}

            {alert && (
                <div className="alert alert-critical fade-up" style={{ marginTop: 12 }}>
                    <span>🚨</span>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Auto-Alert Generated</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{alert.message}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
