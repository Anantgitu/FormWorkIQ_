import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestResult } from '../services/api';

const sourceColors = {
    REUSE: 'badge-reuse',
    NEW_ORDER: 'badge-new',
    PARTIAL_REUSE: 'badge-partial',
};

export default function KittingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        getLatestResult()
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

    if (!data?.daily_kits?.length) return (
        <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No Kitting Data</h3>
            <p style={{ marginBottom: 20 }}>Run an optimization to generate daily kitting lists.</p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>Upload Data</button>
        </div>
    );

    const reuseCount = data.daily_kits.reduce((n, d) => n + d.kits.filter(k => k.source === 'REUSE').length, 0);
    const totalKits = data.daily_kits.reduce((n, d) => n + d.kits.length, 0);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <h1>Daily Kitting Schedule</h1>
                <p>Automated worker picking lists — exactly which panels go where, each day.</p>
            </div>

            {/* Summary */}
            <div className="grid-3 fade-up fade-up-1" style={{ marginBottom: 32 }}>
                {[
                    { icon: '📅', label: 'Work Days', value: data.daily_kits.length },
                    { icon: '📦', label: 'Total Kits', value: totalKits },
                    { icon: '♻️', label: 'Reuse Kits', value: reuseCount },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Daily cards */}
            <div className="fade-up fade-up-2">
                {data.daily_kits.map((day, di) => (
                    <div key={di} className="card" style={{ marginBottom: 12, cursor: 'pointer' }}
                        onClick={() => setExpanded(expanded === di ? -1 : di)}>
                        {/* Day header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                                }}>D{di + 1}</div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.kits.length} kit{day.kits.length > 1 ? 's' : ''}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {day.kits.map((k, ki) => (
                                    <span key={ki} className={`badge ${sourceColors[k.source] || 'badge-new'}`}>{k.source}</span>
                                ))}
                                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '1rem' }}>
                                    {expanded === di ? '▲' : '▼'}
                                </span>
                            </div>
                        </div>

                        {/* Expanded kits */}
                        {expanded === di && (
                            <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                                {day.kits.map((kit, ki) => (
                                    <div key={ki} style={{
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                                        padding: '16px', marginBottom: 10
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{kit.element_id}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {kit.location}</div>
                                            </div>
                                            <span className={`badge ${sourceColors[kit.source] || 'badge-new'}`}>
                                                {kit.source === 'REUSE' ? '♻️' : kit.source === 'NEW_ORDER' ? '🆕' : '🔀'} {kit.source}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {kit.panels.map((p, pi) => (
                                                p.count > 0 && (
                                                    <div key={pi} className="tag">
                                                        {p.panel_type} × {p.count}
                                                        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({p.area_sqm}m²)</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
