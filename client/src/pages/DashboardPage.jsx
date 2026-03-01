import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestResult } from '../services/api';

function KpiCard({ icon, label, value, unit, delta, color, delay = 0 }) {
    const [displayed, setDisplayed] = useState(0);
    const numVal = parseFloat(value) || 0;

    useEffect(() => {
        let start = 0;
        const step = numVal / 40;
        const t = setInterval(() => {
            start += step;
            if (start >= numVal) { setDisplayed(numVal); clearInterval(t); }
            else setDisplayed(Math.floor(start * 10) / 10);
        }, 30);
        return () => clearInterval(t);
    }, [numVal]);

    return (
        <div className="card fade-up" style={{ animationDelay: `${delay}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                {delta && <span className={`kpi-delta ${delta > 0 ? 'up' : 'down'}`}>
                    {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>}
            </div>
            <div className="kpi-row">
                <span className="kpi-value" style={{ color }}>{displayed.toLocaleString()}</span>
                <span className="kpi-unit">{unit}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getLatestResult()
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" />
                <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading optimization results...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="empty-state">
            <div className="icon">📊</div>
            <h3 style={{ marginBottom: 8 }}>No Results Yet</h3>
            <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>Upload your project data to see the optimized KPIs here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                📤 Upload Project Data
            </button>
        </div>
    );

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Optimization Dashboard</h1>
                        <p>{data.project_name || data.project_id} • {data.total_elements} elements processed</p>
                    </div>
                    <span className="badge badge-excellent">✅ Completed</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <KpiCard icon="♻️" label="Panels Saved via Reuse"
                    value={data.panels_saved} unit="panels" color="var(--emerald)" delay={0} />
                <KpiCard icon="💰" label="Total Cost Savings"
                    value={Math.round(data.total_cost_savings_inr / 1000)} unit="K ₹" color="var(--amber)" delay={0.05} />
                <KpiCard icon="📉" label="BoQ Reduction"
                    value={data.savings_percentage} unit="%" color="var(--blue)" delta={data.savings_percentage} delay={0.1} />
                <KpiCard icon="🔄" label="Panel Utilization Rate"
                    value={data.utilization_rate} unit="%" color="var(--purple)" delay={0.15} />
            </div>

            {/* Comparison bars */}
            <div className="grid-2" style={{ marginBottom: 32 }}>
                <div className="card fade-up fade-up-2">
                    <h3 style={{ marginBottom: 20 }}>📦 Panel Count Comparison</h3>
                    {[
                        { label: 'Baseline (Without Optimization)', value: data.baseline_panels_ordered, color: 'var(--red)', max: data.baseline_panels_ordered },
                        { label: 'Optimized (With Reuse)', value: data.optimized_panels_ordered, color: 'var(--emerald)', max: data.baseline_panels_ordered }
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${(item.value / item.max) * 100}%`,
                                    background: item.color
                                }} />
                            </div>
                        </div>
                    ))}
                    <div style={{
                        marginTop: 20, padding: '12px 14px',
                        background: 'rgba(16,185,129,0.08)', borderRadius: 8,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Panels Saved</span>
                        <span style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '1.2rem' }}>
                            {data.panels_saved} panels ({data.savings_percentage}% reduction)
                        </span>
                    </div>
                </div>

                <div className="card fade-up fade-up-2">
                    <h3 style={{ marginBottom: 20 }}>🔗 Reuse Links</h3>
                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {data.reuse_links?.length > 0 ? data.reuse_links.map((link, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                borderBottom: '1px solid var(--border)', fontSize: '0.8rem'
                            }}>
                                <span className="badge badge-reuse">REUSE</span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {link.from_elements?.[0]} → <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{link.to_element}</span>
                                </span>
                                <span style={{ marginLeft: 'auto', color: 'var(--blue-light)', fontSize: '0.75rem' }}>{link.panel_type} ×{link.count}</span>
                            </div>
                        )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reuse links generated</p>}
                    </div>
                    <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {data.reuse_links?.length || 0} reuse connections identified
                    </div>
                </div>
            </div>

            {/* Quick nav */}
            <div className="grid-3 fade-up fade-up-3">
                {[
                    { icon: '📋', title: 'BoQ Details', desc: 'Panel-by-panel cost breakdown', path: '/boq' },
                    { icon: '📦', title: 'Daily Kitting', desc: 'Worker picking lists per day', path: '/kitting' },
                    { icon: '🔍', title: 'Inventory', desc: 'Track panel health status', path: '/inventory' }
                ].map((item, i) => (
                    <button key={i} className="card" style={{ cursor: 'pointer', textAlign: 'left', border: 'none', width: '100%' }}
                        onClick={() => navigate(item.path)}>
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{item.icon}</div>
                        <h3 style={{ marginBottom: 4 }}>{item.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
