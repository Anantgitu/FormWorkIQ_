import { useState, useEffect } from 'react';
import { getInventory } from '../services/api';

const HEALTH_CONFIG = {
    Excellent: { badge: 'badge-excellent', icon: '✅', color: 'var(--emerald)' },
    Good: { badge: 'badge-good', icon: '🔵', color: 'var(--blue)' },
    Needs_Repair: { badge: 'badge-repair', icon: '⚠️', color: 'var(--amber)' },
    Scrap: { badge: 'badge-scrap', icon: '❌', color: 'var(--red)' },
};

export default function InventoryPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ health: '', type: '' });
    const [search, setSearch] = useState('');

    useEffect(() => {
        const params = {};
        if (filter.health) params.health_status = filter.health;
        if (filter.type) params.panel_type = filter.type;
        getInventory(params)
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [filter]);

    const panels = data?.panels?.filter(p =>
        !search || p.qr_code_id.toLowerCase().includes(search.toLowerCase()) ||
        p.panel_type.toLowerCase().includes(search.toLowerCase()) ||
        p.current_location.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const stats = data?.stats || {};

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <h1>Inventory Tracker</h1>
                <p>Real-time panel health status — {stats.total || 0} panels across all locations.</p>
            </div>

            {/* Health summary */}
            <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: 28 }}>
                {[
                    { label: 'Excellent', key: 'excellent', color: 'var(--emerald)', icon: '✅' },
                    { label: 'Good', key: 'good', color: 'var(--blue)', icon: '🔵' },
                    { label: 'Needs Repair', key: 'needs_repair', color: 'var(--amber)', icon: '⚠️' },
                    { label: 'Scrapped', key: 'scrap', color: 'var(--red)', icon: '❌' },
                ].map((s, i) => (
                    <button key={i} className="card"
                        style={{ textAlign: 'center', cursor: 'pointer', border: filter.health === s.label.replace(' ', '_') ? '1px solid var(--blue)' : undefined }}
                        onClick={() => setFilter(f => ({ ...f, health: f.health === s.label ? '' : s.label }))}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{stats[s.key] || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="fade-up fade-up-2" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    placeholder="🔎  Search QR code, type, or location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200, background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                        fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none'
                    }}
                />
                <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
                        outline: 'none', cursor: 'pointer'
                    }}>
                    <option value="">All Panel Types</option>
                    {['P-2x1', 'P-1x1', 'P-0.5x1', 'P-0.3x1'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(filter.health || filter.type || search) && (
                    <button className="btn btn-secondary" onClick={() => { setFilter({ health: '', type: '' }); setSearch(''); }}>
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Panel grid */}
            <div className="grid-auto fade-up fade-up-3">
                {panels.slice(0, 60).map((panel, i) => {
                    const hc = HEALTH_CONFIG[panel.health_status] || HEALTH_CONFIG.Good;
                    const usePct = Math.min((panel.use_count / panel.max_reuses) * 100, 100);
                    return (
                        <div key={i} className="card card-sm">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--blue-light)', fontWeight: 600 }}>
                                    {panel.qr_code_id}
                                </div>
                                <span className={`badge ${hc.badge}`}>{hc.icon} {panel.health_status}</span>
                            </div>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{panel.panel_type}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                                📍 {panel.current_location}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6, color: 'var(--text-secondary)' }}>
                                <span>Uses</span>
                                <span style={{ color: usePct > 80 ? 'var(--red)' : 'var(--text-secondary)' }}>
                                    {panel.use_count}/{panel.max_reuses}
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${usePct}%`,
                                    background: usePct > 80 ? 'var(--red)' : usePct > 60 ? 'var(--amber)' : 'var(--emerald)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {panels.length === 0 && (
                <div className="empty-state">
                    <div className="icon">🔍</div>
                    <h3>No panels found</h3>
                    <p>Upload project data to populate inventory.</p>
                </div>
            )}
        </div>
    );
}
