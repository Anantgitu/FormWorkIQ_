import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', icon: '🏗️', label: 'Home' },
    { path: '/upload', icon: '📤', label: 'Upload Data' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/boq', icon: '📋', label: 'BoQ Optimizer' },
    { path: '/kitting', icon: '📦', label: 'Kitting Schedule' },
    { path: '/inventory', icon: '🔍', label: 'Inventory' },
    { path: '/scan', icon: '📱', label: 'QR Scanner' },
    { path: '/alerts', icon: '🔔', label: 'Alerts' },
];

export default function Sidebar() {
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 'var(--sidebar-width)',
            height: '100vh',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 0 24px',
            zIndex: 100,
            overflowY: 'auto'
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem'
                    }}>⚙️</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>FormworkIQ</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--blue-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>L&T CreaTech</div>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <div style={{ padding: '0 10px', flex: 1 }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            marginBottom: '2px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                            transition: 'all var(--transition)',
                            borderLeft: isActive ? '2px solid var(--blue)' : '2px solid transparent',
                        })}
                    >
                        <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pulse-dot" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engine Ready</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Optimizer v1.0 • FastAPI
                </div>
            </div>
        </nav>
    );
}
