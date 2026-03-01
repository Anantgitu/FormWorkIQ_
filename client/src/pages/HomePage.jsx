import { useNavigate } from 'react-router-dom';

const features = [
    { icon: '🧠', title: '2D Bin Packing', desc: 'Algorithmically fills required formwork area using optimal standard panel combinations' },
    { icon: '♻️', title: 'Repetition Matcher', desc: 'Tracks freed panels to eliminate redundant purchases — same panels, new floors' },
    { icon: '📋', title: 'BoQ Optimizer', desc: 'Generates lean Bill of Quantities; baseline vs. optimized with ₹ savings calculation' },
    { icon: '📦', title: 'Daily Kitting', desc: 'Auto-generates per-day worker picking lists — no missing bolts, no delays' },
    { icon: '🔍', title: 'Panel Tracking', desc: 'Health-scoring for every panel via QR scan feedback loop' },
    { icon: '🔔', title: 'Smart Alerts', desc: 'Auto-triggers replacement orders when panels are scrapped or nearing wear limit' },
];

const stats = [
    { value: '40%', label: 'Average Cost Savings', color: 'var(--emerald)' },
    { value: '7-10%', label: 'of Total Build Cost (Formwork)', color: 'var(--amber)' },
    { value: '50x', label: 'Max Panel Reuse Cycles', color: 'var(--blue)' },
    { value: '∞', label: 'Floors Optimized', color: 'var(--purple)' },
];

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
            {/* Hero */}
            <div className="fade-up" style={{
                textAlign: 'center',
                padding: '60px 40px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
                borderRadius: 24,
                marginBottom: 48,
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--blue), transparent)'
                }} />

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: 20,
                    border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.8rem',
                    color: 'var(--blue-light)', fontWeight: 600, marginBottom: 24
                }}>
                    <span className="pulse-dot" />
                    L&T CreaTech 2026 — Problem Statement 4
                </div>

                <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>
                    <span className="gradient-text">Formwork</span>IQ
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
                    AI-driven formwork kitting & BoQ optimization. Stop over-ordering.
                    Start reusing intelligently.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}
                        onClick={() => navigate('/upload')}>
                        🚀 Start Optimization
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '1rem', padding: '12px 28px' }}
                        onClick={() => navigate('/dashboard')}>
                        📊 View Dashboard
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: 48 }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="fade-up fade-up-2" style={{ marginBottom: 48 }}>
                <p className="section-label">How It Works</p>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden'
                }}>
                    {['Upload Schedule', 'Run Algorithm', 'View BoQ Savings', 'Kit & Track'].map((step, i) => (
                        <div key={i} style={{
                            padding: '24px 16px', textAlign: 'center',
                            borderRight: i < 3 ? '1px solid var(--border)' : 'none'
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 12px', fontSize: '0.9rem', fontWeight: 700, color: '#fff'
                            }}>
                                {i + 1}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{step}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="fade-up fade-up-3">
                <p className="section-label">System Capabilities</p>
                <div className="grid-3">
                    {features.map((f, i) => (
                        <div key={i} className="card" style={{ cursor: 'default' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{f.icon}</div>
                            <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
