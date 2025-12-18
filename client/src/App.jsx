import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis 
} from 'recharts';
import { Activity, Terminal, Grid, FlaskConical, RefreshCcw, Share2, Target, Zap, Sparkles, FileText, ShieldAlert } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [sequences, setSequences] = useState([]);
  const [selectedIds, setSelectedIds] = useState({ a: '', b: '' });
  const [analysis, setAnalysis] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({ totalSequences: 0, averageAlignmentScore: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, st, m] = await Promise.all([
        axios.get(`${API_BASE}/sequences`),
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/analyze/matrix`)
      ]);
      setSequences(s.data); setStats(st.data); setMatrix(m.data);
      addLog("Sentinel Core: Operativo.");
    } catch (err) { addLog("❌ Error de enlace de datos."); }
  };

  const addLog = (m) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p.slice(0, 3)]);

  const exportReport = () => {
    if (!analysis) return alert("Primero ejecute un diagnóstico.");
    const reportText = `REPORTE GENÓMICO SENTINEL\nID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}\nScore Similitud: ${analysis.similarityScore}%\nDiagnóstico: ${analysis.similarityScore > 80 ? 'Variante Estable' : 'Alerta de Mutación'}`;
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "diagnostico_genomico.txt";
    document.body.appendChild(element);
    element.click();
    addLog("📁 Reporte exportado con éxito.");
  };

  const filteredSequences = useMemo(() => {
    if (!activeFilter) return sequences;
    return sequences.filter(s => activeFilter.includes(s.identifier));
  }, [sequences, activeFilter]);

  return (
    <div className="ultra-container">
      <header className="main-nav">
        <div className="logo-group">
          <Activity className="neon-icon" size={24} />
          <div>
            <h1>BIOSTATS <span>ULTRA</span></h1>
            <p>ADVANCED GENOMIC INTELLIGENCE</p>
          </div>
        </div>
        <div className="header-metrics">
          <div className="h-stat">LINAJES: <strong>{clusters.length}</strong></div>
          <div className="h-stat">SCORE GLOBAL: <strong>{Math.round(stats.averageAlignmentScore)}%</strong></div>
          <button className="export-btn" onClick={exportReport}><FileText size={14}/> EXPORTAR</button>
          <button className="btn-icon" onClick={loadData}><RefreshCcw size={16}/></button>
        </div>
      </header>

      <div className="grid-layout">
        <aside className="sidebar-area">
          <section className="glass-card">
            <h3 className="card-tag"><FlaskConical size={14}/> DIAGNÓSTICO IA</h3>
            <div className="ui-fields">
              <select className="ui-select" value={selectedIds.a} onChange={e => setSelectedIds({...selectedIds, a: e.target.value})}>
                <option value="">Referencia...</option>
                {sequences.map(s => <option key={s.id} value={s.id}>{s.identifier}</option>)}
              </select>
              <select className="ui-select" value={selectedIds.b} onChange={e => setSelectedIds({...selectedIds, b: e.target.value})}>
                <option value="">Muestra...</option>
                {sequences.map(s => <option key={s.id} value={s.id}>{s.identifier}</option>)}
              </select>
              <button className="ui-btn" onClick={() => {
                setLoading(true);
                axios.post(`${API_BASE}/analyze/compare`, { idA: selectedIds.a, idB: selectedIds.b })
                  .then(res => { setAnalysis(res.data); addLog("✅ Análisis completo."); })
                  .finally(() => setLoading(false));
              }} disabled={loading}>EJECUTAR</button>
            </div>
          </section>

          {analysis && (
            <div className="glass-card fade-in">
              <div className="score-hero">
                <span className="s-val">{analysis.similarityScore}</span>
                <span className="s-lbl">PRECISIÓN GENÉTICA</span>
              </div>
              <div className={`status-indicator ${analysis.similarityScore < 70 ? 'danger' : 'safe'}`}>
                {analysis.similarityScore < 70 ? <ShieldAlert size={14}/> : <Zap size={14}/>}
                {analysis.similarityScore < 70 ? 'ALERTA DE DERIVA' : 'CEPA CONSISTENTE'}
              </div>
            </div>
          )}

          <div className="glass-card console-box">
            <h3 className="card-tag"><Terminal size={14}/> TERMINAL</h3>
            <div className="console-txt">
              {logs.map((l, i) => <div key={i} className="log-entry">{l}</div>)}
            </div>
          </div>
        </aside>

        <main className="content-area">
          <div className="viz-split">
            <div className="glass-card">
              <h3 className="card-tag">MAPA DE POBLACIÓN</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSequences}>
                    <Bar dataKey="id" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: '#020617', border: '1px solid #1e293b'}}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card">
              <h3 className="card-tag">INSIGHTS IA</h3>
              <div className="insights-content">
                <div className="insight-item">
                  <Sparkles size={16} className="cyan-text"/>
                  <p><strong>Divergencia:</strong> {analysis ? (100 - analysis.similarityScore) : '--'}% en relación al ancestro.</p>
                </div>
                <div className="insight-item">
                  <Target size={16} className="cyan-text"/>
                  <p><strong>Hotspot:</strong> Región 4-12 presenta mayor mutación.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="card-tag"><Share2 size={14}/> CLUSTERS DE EVOLUCIÓN</h3>
            <div className="cluster-grid-smart">
              {clusters.map((c, i) => (
                <div key={i} className={`cluster-tile ${activeFilter === c ? 'active' : ''}`} onClick={() => setActiveFilter(activeFilter === c ? null : c)}>
                  <span className="t-head">LINAJE #{i+1}</span>
                  <div className="t-tags">
                    {c.map(t => <span key={t} className="tag-pill">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 className="card-tag"><Grid size={14}/> MATRIZ DE COMPARACIÓN DINÁMICA</h3>
            <div className="table-flow">
              <table className="u-table">
                <thead>
                  <tr>
                    <th className="f-col">ID</th>
                    {filteredSequences.map(s => <th key={s.id}>{s.identifier.substring(0,3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredSequences.map(row => (
                    <tr key={row.id}>
                      <td className="f-col">{row.identifier}</td>
                      {filteredSequences.map(col => {
                        const m = matrix.find(x => (x.seq_a_id === row.id && x.seq_b_id === col.id) || (x.seq_a_id === col.id && x.seq_b_id === row.id));
                        const sc = m ? m.score : 0;
                        return <td key={col.id} className="score-cell" style={{backgroundColor: sc > 0 ? `rgba(34, 211, 238, ${sc/110})` : 'transparent'}} onClick={() => setSelectedIds({a: row.id, b: col.id})}>{sc || '-'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;