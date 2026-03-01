import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadProjectJSON } from '../services/api';

const mockData = {
    project_id: "LNT-TechPark-TowerA",
    project_name: "L&T TechPark Tower A",
    tasks: [
        { element_id: "COL-F1-01", element_type: "Column", location: "Floor_1_Zone_A", shape: "Rectangle", dimensions: { width: 1.0, height: 3.0 }, pour_date: "2026-03-01", cure_days: 3 },
        { element_id: "COL-F1-02", element_type: "Column", location: "Floor_1_Zone_A", shape: "Rectangle", dimensions: { width: 1.0, height: 3.0 }, pour_date: "2026-03-01", cure_days: 3 },
        { element_id: "WALL-F1-01", element_type: "Wall", location: "Floor_1_Zone_B", shape: "Rectangle", dimensions: { width: 5.0, height: 3.0 }, pour_date: "2026-03-03", cure_days: 3 },
        { element_id: "WALL-F1-02", element_type: "Wall", location: "Floor_1_Zone_B", shape: "Rectangle", dimensions: { width: 4.0, height: 3.0 }, pour_date: "2026-03-03", cure_days: 3 },
        { element_id: "COL-F2-01", element_type: "Column", location: "Floor_2_Zone_A", shape: "Rectangle", dimensions: { width: 0.8, height: 3.0 }, pour_date: "2026-03-05", cure_days: 3 },
        { element_id: "COL-F2-02", element_type: "Column", location: "Floor_2_Zone_A", shape: "Rectangle", dimensions: { width: 0.8, height: 3.0 }, pour_date: "2026-03-05", cure_days: 3 },
        { element_id: "WALL-F2-01", element_type: "Wall", location: "Floor_2_Zone_B", shape: "Rectangle", dimensions: { width: 5.0, height: 3.0 }, pour_date: "2026-03-07", cure_days: 3 },
        { element_id: "WALL-F2-02", element_type: "Wall", location: "Floor_2_Zone_B", shape: "Rectangle", dimensions: { width: 4.0, height: 3.0 }, pour_date: "2026-03-07", cure_days: 3 },
        { element_id: "COL-F3-01", element_type: "Column", location: "Floor_3_Zone_A", shape: "Rectangle", dimensions: { width: 0.8, height: 3.0 }, pour_date: "2026-03-10", cure_days: 3 },
        { element_id: "COL-F3-02", element_type: "Column", location: "Floor_3_Zone_A", shape: "Rectangle", dimensions: { width: 0.8, height: 3.0 }, pour_date: "2026-03-10", cure_days: 3 },
        { element_id: "WALL-F3-01", element_type: "Wall", location: "Floor_3_Zone_B", shape: "Rectangle", dimensions: { width: 5.0, height: 3.0 }, pour_date: "2026-03-11", cure_days: 3 },
        { element_id: "WALL-F3-02", element_type: "Wall", location: "Floor_3_Zone_C", shape: "Rectangle", dimensions: { width: 3.0, height: 3.0 }, pour_date: "2026-03-12", cure_days: 3 }
    ]
};

export default function UploadPage() {
    const [dragging, setDragging] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const fileRef = useRef();

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                setFileData(parsed);
                setError(null);
            } catch {
                setError('Invalid JSON file. Please upload a valid project JSON.');
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const loadMockData = () => {
        setFileData(mockData);
        setError(null);
    };

    const handleSubmit = async () => {
        const data = fileData || mockData;
        setLoading(true);
        setError(null);
        try {
            await uploadProjectJSON(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Upload failed. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header fade-up">
                <h1>Upload Project Data</h1>
                <p>Upload your building schedule JSON or use the built-in mock data to run the optimizer.</p>
            </div>

            {/* Drop zone */}
            <div
                className="fade-up fade-up-1"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                    border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--border)'}`,
                    borderRadius: 16,
                    padding: '60px 40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragging ? 'rgba(59,130,246,0.05)' : 'var(--bg-card)',
                    transition: 'all var(--transition)',
                    marginBottom: 24
                }}>
                <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📁</div>
                <h3 style={{ marginBottom: 8 }}>Drop your project JSON here</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or click to select a file</p>
            </div>

            {/* File preview */}
            {fileData && (
                <div className="card fade-up" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3>✅ {fileData.project_name || fileData.project_id}</h3>
                        <span className="badge badge-good">{fileData.tasks?.length || 0} elements</span>
                    </div>
                    <div className="grid-3" style={{ gap: 12 }}>
                        {[
                            { label: 'Project ID', value: fileData.project_id },
                            { label: 'Columns', value: fileData.tasks?.filter(t => t.element_type === 'Column').length || 0 },
                            { label: 'Walls', value: fileData.tasks?.filter(t => t.element_type === 'Wall').length || 0 }
                        ].map((info, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 14px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{info.label}</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{info.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-critical fade-up" style={{ marginBottom: 16 }}>
                    <span>❌</span>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Error</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{error}</div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="fade-up fade-up-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={loadMockData}>
                    📂 Load Mock Data (3-Floor Building)
                </button>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                    onClick={handleSubmit}
                    disabled={loading}>
                    {loading ? '⚙️ Running Optimizer...' : '🚀 Run Optimization'}
                </button>
            </div>

            {loading && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Running 2D Bin Packing &amp; Repetition Matcher...
                    </p>
                </div>
            )}

            {/* Schema guide */}
            <div className="card fade-up fade-up-3" style={{ marginTop: 32 }}>
                <h4 style={{ marginBottom: 16, color: 'var(--text-muted)' }}>Expected JSON Format</h4>
                <pre style={{
                    background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 8,
                    fontSize: '0.75rem', color: 'var(--emerald-light)', overflowX: 'auto',
                    lineHeight: 1.7, fontFamily: 'monospace'
                }}>{`{
  "project_id": "LNT-Tower-A",
  "tasks": [{
    "element_id": "COL-F1-01",
    "element_type": "Column",
    "location": "Floor_1_Zone_A",
    "dimensions": { "width": 1.0, "height": 3.0 },
    "pour_date": "2026-03-01",
    "cure_days": 3
  }]
}`}</pre>
            </div>
        </div>
    );
}
