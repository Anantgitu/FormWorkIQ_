import { useState, useEffect } from 'react';
import { getAlerts } from '../services/api';

const SEVERITY_CONFIG = {
    critical: { border: 'var(--red)', bg: 'rgba(239,68,68,0.06)', icon: '🚨', badge: 'badge-scrap' },
    warning: { border: 'var(--amber)', bg: 'rgba(245,158,11,0.06)', icon: '⚠️', badge: 'badge-repair' },
    info: { border: 'var(--blue)', bg: 'rgba(59,130,246,0.06)', icon: 'ℹ️', badge: 'badge-good' },
};

const MOCK_ALERTS = [
    { id: '1', type: 'SCRAP', severity: 'critical', qr_code: 'QR-P-2x1-007', panel_type: 'P-2x1', location: 'Floor_1_Zone_A', message: 'Panel QR-P-2x1-007 is scrapped — order 1 replacement P-2x1 panel' },
    { id: '2', type: 'HIGH_USAGE', severity: 'warning', qr_code: 'QR-P-1x1-003', panel_type: 'P-1x1', location: 'Floor_2_Zone_B', message: 'Panel QR-P-1x1-003 has 43 uses — inspect before next deployment' },
    { id: '3', type: 'NEEDS_REPAIR', severity: 'warning', qr_code: 'QR-P-0.5x1-011', panel_type: 'P-0.5x1', location: 'Yard', message: 'Panel QR-P-0.5x1-011 needs repair before use' },
    { id: '4', type: 'HIGH_USAGE', severity: 'warning', qr_code: 'QR-P-2x1-018', panel_type: 'P-2x1', location: 'Floor_3_Zone_A', message: 'Panel QR-P-2x1-018 has 46 uses — inspect before next deployment' },
];

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [counts, setCounts] = useState({ scrap: 0, high_usage: 0, needs_repair: 0 });
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(new Set());

    useEffect(() => {
        getAlerts()
            .then(res => {
                setAlerts(res.data.alerts || []);
                setCounts(res.data.counts || {});
            })
            .catch(() => {
                // Use mock alerts when backend not running
                setAlerts(MOCK_ALERTS);
                setCounts({ scrap: 1, high_usage: 2, needs_repair: 1 });
            })
            .finally(() => setLoading(false));
    }, []);

    const visible = alerts.filter(a => !dismissed.has(a.id));
    const criticalCount = visible.filter(a => a.severity === 'critical').length;

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Alerts & Notifications</h1>
                        <p>Auto-triggered when panels are scrapped, damaged, or near their reuse limit.</p>
                    </div>
                    {criticalCount > 0 && (
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', padding: '4px 12px', borderRadius: 20, fontSize: '0.875rem', fontWeight: 700 }}>
                            🚨 {criticalCount} Critical
                        </span>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="grid-3 fade-up fade-up-1" style={{ marginBottom: 32 }}>
                {[
                    { label: 'Panels Scrapped', value: counts.scrap, color: 'var(--red)', icon: '❌' },
                    { label: 'High Usage', value: counts.high_usage, color: 'var(--amber)', icon: '⚠️' },
                    { label: 'Needs Repair', value: counts.needs_repair, color: 'var(--blue)', icon: '🔧' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Alert list */}
            <div className="fade-up fade-up-2">
                {visible.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">✅</div>
                        <h3>All Clear</h3>
                        <p>No active alerts. All panels are within acceptable health thresholds.</p>
                    </div>
                )}

                {visible.map((a, i) => {
                    const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.info;
                    return (
                        <div key={a.id || i} className="alert" style={{
                            background: cfg.bg, borderColor: cfg.border, marginBottom: 12, borderRadius: 10
                        }}>
                            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{cfg.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span className={`badge ${cfg.badge}`}>{a.type}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--blue-light)' }}>{a.qr_code}</span>
                                        <span className="tag" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{a.panel_type}</span>
                                    </div>
                                    <button onClick={() => setDismissed(d => new Set([...d, a.id]))}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        Dismiss
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.message}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>📍 {a.location}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {dismissed.size > 0 && (
                <button className="btn btn-secondary" onClick={() => setDismissed(new Set())} style={{ marginTop: 16 }}>
                    ↩ Restore {dismissed.size} dismissed alert{dismissed.size > 1 ? 's' : ''}
                </button>
            )}
        </div>
    );
}
