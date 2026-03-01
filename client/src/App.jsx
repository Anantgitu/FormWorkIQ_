import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import BoQPage from './pages/BoQPage';
import KittingPage from './pages/KittingPage';
import InventoryPage from './pages/InventoryPage';
import ScanPage from './pages/ScanPage';
import AlertsPage from './pages/AlertsPage';

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/boq" element={<BoQPage />} />
                        <Route path="/kitting" element={<KittingPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/scan" element={<ScanPage />} />
                        <Route path="/alerts" element={<AlertsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
