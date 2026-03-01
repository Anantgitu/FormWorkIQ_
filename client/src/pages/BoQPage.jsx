import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestResult } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
                <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{label}</p>
                {payload.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
                        <span style={{ color: p.fill, fontWeight: 700 }}>{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function BoQPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getLatestResult()
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

    if (!data) return (
        <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No BoQ Data</h3>
            <p style={{ marginBottom: 20 }}>Run an optimization first.</p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>Upload Data</button>
        </div>
    );

    const chartData = data.boq?.filter(b => b.baseline_count > 0).map(b => ({
        name: b.panel_type,
        'Baseline (Human)': b.baseline_count,
        'Optimized (AI)': b.optimized_count,
        savings: b.savings_inr
    }));

    const totalSavings = data.boq?.reduce((s, b) => s + b.savings_inr, 0) || 0;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <h1>Bill of Quantities Optimizer</h1>
                <p>Baseline vs AI-optimized panel requirements — with exact rupee savings per panel type.</p>
            </div>

            {/* Savings banner */}
            <div className="fade-up fade-up-1" style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 12, padding: '20px 24px', marginBottom: 32,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
            }}>
                <div>
                    <h2 style={{ color: 'var(--emerald-light)' }}>
                        ₹{totalSavings.toLocaleString('en-IN')} Saved
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {data.panels_saved} panels eliminated through reuse — {data.savings_percentage}% BoQ reduction
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-light)' }}>
                        {data.optimized_panels_ordered} panels
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        vs {data.baseline_panels_ordered} baseline
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card fade-up fade-up-2" style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 24 }}>Panel Count: Baseline vs Optimized</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} />
                        <Bar dataKey="Baseline (Human)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Optimized (AI)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed table */}
            <div className="card fade-up fade-up-3">
                <h3 style={{ marginBottom: 20 }}>Detailed BoQ Breakdown</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Panel Type</th>
                            <th>Baseline Count</th>
                            <th>Optimized Count</th>
                            <th>Panels Saved</th>
                            <th>Unit Cost (₹)</th>
                            <th>₹ Savings</th>
                            <th>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.boq?.map((b, i) => {
                            const saved = b.baseline_count - b.optimized_count;
                            const pct = b.baseline_count > 0 ? Math.round((saved / b.baseline_count) * 100) : 0;
                            return (
                                <tr key={i}>
                                    <td>{b.panel_type}</td>
                                    <td style={{ color: 'var(--red)' }}>{b.baseline_count}</td>
                                    <td style={{ color: 'var(--emerald)' }}>{b.optimized_count}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--amber)' }}>-{saved}</td>
                                    <td>₹{b.unit_cost_inr.toLocaleString()}</td>
                                    <td style={{ color: 'var(--emerald-light)', fontWeight: 700 }}>
                                        ₹{b.savings_inr.toLocaleString('en-IN')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--emerald)', borderRadius: 4 }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-light)', fontWeight: 600 }}>{pct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
