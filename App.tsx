
import React, { useState, useEffect } from 'react';
import { AppState, InspectionResult } from './types';
import { compareForgingToCAD } from './services/geminiService';
import Dashboard from './components/Dashboard';
import CaptureScreen from './components/CaptureScreen';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'LOGIN',
    supervisor: null,
    cadImage: null,
    currentInspection: {
      actualImage: null,
      result: null,
      isAnalyzing: false,
    },
    history: [],
  });

  const [loginData, setLoginData] = useState({ username: '', station: 'STATION_A12' });

  // Persistence for the demo session
  useEffect(() => {
    const saved = localStorage.getItem('mf_history');
    if (saved) setState(prev => ({ ...prev, history: JSON.parse(saved) }));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username.length > 2) {
      setState(prev => ({ ...prev, view: 'SETUP', supervisor: loginData.username }));
    }
  };

  const handleCadUpload = (base64: string) => {
    setState(prev => ({ ...prev, cadImage: base64, view: 'DASHBOARD' }));
  };

  const handleActualCapture = async (base64: string) => {
    if (!state.cadImage) return;

    setState(prev => ({ 
      ...prev, 
      view: 'INSPECT',
      currentInspection: { ...prev.currentInspection, actualImage: base64, isAnalyzing: true, result: null } 
    }));
    
    try {
      const result = await compareForgingToCAD(state.cadImage, base64);
      setState(prev => {
        const newHistory = [...prev.history, result];
        localStorage.setItem('mf_history', JSON.stringify(newHistory));
        return { 
          ...prev, 
          history: newHistory,
          currentInspection: { ...prev.currentInspection, result, isAnalyzing: false } 
        };
      });
    } catch (err: any) {
      alert("Analysis error: " + err.message);
      setState(prev => ({ ...prev, view: 'DASHBOARD', currentInspection: { ...prev.currentInspection, isAnalyzing: false } }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      {state.view !== 'LOGIN' && (
        <header className="py-4 px-8 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <i className="fas fa-industry text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter">METALFORGE <span className="text-blue-500">QC</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">{state.view} MODE • {state.supervisor}</p>
            </div>
          </div>
          <button 
            onClick={() => setState(prev => ({ ...prev, view: 'LOGIN', supervisor: null }))}
            className="text-slate-500 hover:text-white text-sm"
          >
            <i className="fas fa-power-off"></i>
          </button>
        </header>
      )}

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {state.view === 'LOGIN' && (
          <div className="max-w-md mx-auto mt-20 p-10 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-900/40">
                    <i className="fas fa-lock text-2xl text-white"></i>
                </div>
                <h2 className="text-2xl font-bold">Supervisor Login</h2>
                <p className="text-slate-500 text-sm">Industrial Control Panel Access</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
                    <input 
                        required
                        value={loginData.username}
                        onChange={e => setLoginData({...loginData, username: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Operator ID"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Workstation</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none">
                        <option>FORGING STATION ALPHA-12</option>
                        <option>BENDING UNIT BETA-09</option>
                        <option>CASTING LINE DELTA-01</option>
                    </select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2">
                    Access Terminal <i className="fas fa-arrow-right text-sm"></i>
                </button>
            </form>
          </div>
        )}

        {state.view === 'SETUP' && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-2">
                <h2 className="text-4xl font-black">Register Order Target</h2>
                <p className="text-slate-400">Upload the CAD reference model for the current production run.</p>
            </div>
            <div className="bg-slate-900 border-4 border-dashed border-slate-800 rounded-3xl p-12 transition-all hover:border-blue-500/50">
                <CaptureScreen 
                    onCapture={handleCadUpload} 
                    isProcessing={false} 
                />
            </div>
            <p className="text-xs text-slate-600 italic">Accepted formats: STEP Visualization, PNG/JPG CAD Export, 3D Render Screen</p>
          </div>
        )}

        {state.view === 'DASHBOARD' && (
          <Dashboard 
            history={state.history} 
            onStartInspection={() => setState(prev => ({ ...prev, view: 'INSPECT', currentInspection: { ...prev.currentInspection, result: null, actualImage: null } }))}
            onNewOrder={() => setState(prev => ({ ...prev, view: 'SETUP' }))}
          />
        )}

        {state.view === 'INSPECT' && (
          <div className="space-y-8">
            {!state.currentInspection.result && !state.currentInspection.isAnalyzing ? (
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <h2 className="text-3xl font-bold">Physical Scan Input</h2>
                <CaptureScreen 
                    onCapture={handleActualCapture} 
                    isProcessing={false} 
                />
              </div>
            ) : state.currentInspection.isAnalyzing ? (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-8">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-scanner-gun text-4xl text-blue-500 animate-pulse"></i>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Comparing Vectors...</h3>
                    <p className="text-slate-500 font-mono text-sm tracking-widest">RUNNING CROSS-IMAGE ANALYSIS V4.0</p>
                </div>
              </div>
            ) : state.currentInspection.result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <div className={`p-8 rounded-3xl border-2 flex flex-col md:flex-row justify-between items-center gap-6 ${state.currentInspection.result.status === 'QA_PASSED' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${state.currentInspection.result.status === 'QA_PASSED' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
                            <i className={`fas ${state.currentInspection.result.status === 'QA_PASSED' ? 'fa-check-double' : 'fa-triangle-exclamation'}`}></i>
                        </div>
                        <div>
                            <h2 className={`text-4xl font-black ${state.currentInspection.result.status === 'QA_PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {state.currentInspection.result.status.replace('_', ' ')}
                            </h2>
                            <p className="text-slate-400 font-mono uppercase tracking-tighter mt-1">{state.currentInspection.result.id} • CONFIDENCE {(state.currentInspection.result.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setState(prev => ({ ...prev, view: 'DASHBOARD' }))}
                        className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all border border-slate-700"
                    >
                        Return to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <i className="fas fa-list-check text-slate-500"></i> Anomaly Report
                            </h3>
                            <div className="space-y-4">
                                {state.currentInspection.result.anomalies.length > 0 ? state.currentInspection.result.anomalies.map((a, i) => (
                                    <div key={i} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 flex gap-4">
                                        <div className={`w-1 h-auto rounded-full ${a.severity === 'high' ? 'bg-rose-500' : a.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{a.type} • {a.location}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${a.severity === 'high' ? 'text-rose-400 border-rose-900 bg-rose-950/30' : 'text-slate-400 border-slate-700'}`}>
                                                    {a.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-200">{a.description}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-emerald-950/10 border border-dashed border-emerald-500/20 rounded-2xl">
                                        <p className="text-emerald-500 font-bold">Zero Deviations Detected</p>
                                        <p className="text-xs text-slate-500 mt-1">Part matches reference within tolerance</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Reference Design</p>
                                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-square">
                                        <img src={state.cadImage || ''} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Physical Output</p>
                                    <div className="rounded-xl overflow-hidden border border-slate-800 aspect-square">
                                        <img src={state.currentInspection.actualImage || ''} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-3xl">
                            <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i> Engineering Summary
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed italic">
                                "{state.currentInspection.result.summary}"
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 px-10 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <div>MetalForge Systems • Secure Terminal</div>
          <div>Shift Sync: {new Date().toLocaleDateString()}</div>
      </footer>
    </div>
  );
};

export default App;
