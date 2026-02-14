
import React from 'react';
import { InspectionResult, ShiftStats } from '../types';

interface DashboardProps {
  history: InspectionResult[];
  onStartInspection: () => void;
  onNewOrder: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onStartInspection, onNewOrder }) => {
  const stats: ShiftStats = history.reduce((acc, curr) => {
    acc.totalInspected++;
    if (curr.status === 'QA_PASSED') acc.passed++;
    else acc.failed++;
    
    curr.anomalies.forEach(a => {
      acc.anomalyCounts[a.type] = (acc.anomalyCounts[a.type] || 0) + 1;
    });
    return acc;
  }, { totalInspected: 0, passed: 0, failed: 0, anomalyCounts: {} } as ShiftStats);

  const anomalyEntries = Object.entries(stats.anomalyCounts).sort((a, b) => b[1] - a[1]);
  const maxAnomalies = Math.max(...Object.values(stats.anomalyCounts), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Shift Overview</h2>
          <p className="text-slate-400">Station A-12 • Day Shift</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onNewOrder} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-2">
            <i className="fas fa-file-invoice"></i> Change Order
          </button>
          <button onClick={onStartInspection} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i> New Inspection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Total Output</p>
          <p className="text-4xl font-mono font-bold text-white">{stats.totalInspected}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-emerald-500/80 text-xs font-bold tracking-widest uppercase mb-1">QA Passed</p>
          <p className="text-4xl font-mono font-bold text-emerald-400">{stats.passed}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-rose-500/80 text-xs font-bold tracking-widest uppercase mb-1">QA Failed</p>
          <p className="text-4xl font-mono font-bold text-rose-400">{stats.failed}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-blue-500/80 text-xs font-bold tracking-widest uppercase mb-1">Yield Rate</p>
          <p className="text-4xl font-mono font-bold text-blue-400">
            {stats.totalInspected > 0 ? ((stats.passed / stats.totalInspected) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-blue-500"></i> Anomaly Distribution
          </h3>
          <div className="space-y-6">
            {anomalyEntries.length > 0 ? anomalyEntries.map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{type}</span>
                  <span className="text-slate-500">{count} occurrences</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(count / maxAnomalies) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                    <i className="fas fa-clipboard-check text-3xl mb-2"></i>
                    <p>No defects recorded yet</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-history text-slate-400"></i> Recent Logs
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 custom-scrollbar">
            {history.length > 0 ? history.slice().reverse().map((item) => (
              <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${item.status === 'QA_PASSED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div>
                    <p className="font-mono text-xs text-slate-500">{item.id}</p>
                    <p className="font-bold text-sm text-slate-200">{item.status.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  <p className="text-xs text-slate-400">{item.anomalies.length} defects</p>
                </div>
              </div>
            )) : (
                <p className="text-center text-slate-600 py-10">Waiting for first scan...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
