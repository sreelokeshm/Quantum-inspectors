
import React from 'react';
import { InspectionResult } from '../types';

interface ResultsDisplayProps {
  result: InspectionResult;
  onReset: () => void;
  imageUrl: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset, imageUrl }) => {
  // Fixed: 'isMatched' and 'criteria' do not exist on InspectionResult. 
  // We use 'status' and derive analysis from 'anomalies'.
  const { status, summary, confidence, anomalies } = result;
  const isMatched = status === 'QA_PASSED';

  const StatusIcon = ({ statusType }: { statusType: 'pass' | 'fail' }) => (
    statusType === 'pass' 
      ? <i className="fas fa-check-circle text-emerald-400"></i>
      : <i className="fas fa-exclamation-triangle text-rose-400"></i>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`p-6 rounded-2xl border-l-8 shadow-xl ${isMatched ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/30 border-rose-500'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {isMatched ? 'MATCHED' : 'NOT MATCHED'}
              <span className="text-sm font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                {(confidence * 100).toFixed(0)}% Confidence
              </span>
            </h2>
            <p className="mt-2 text-slate-300 text-lg">{summary}</p>
          </div>
          <div className={`text-6xl ${isMatched ? 'text-emerald-400' : 'text-rose-400'}`}>
             <i className={`fas ${isMatched ? 'fa-shield-check' : 'fa-circle-xmark'}`}></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b border-slate-700 pb-2">Technical Analysis</h3>
          
          <div className="space-y-4">
            {/* Logic to map detected anomalies back to the technical categories */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center gap-3 mb-1">
                 <StatusIcon statusType={anomalies.some(a => a.type.toLowerCase().includes('geometry')) ? 'fail' : 'pass'} />
                 <span className="font-bold">Geometry & Proportion</span>
               </div>
               <p className="text-sm text-slate-400 pl-7">
                 {anomalies.find(a => a.type.toLowerCase().includes('geometry'))?.description || "Geometric parameters within tolerance."}
               </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center gap-3 mb-1">
                 <StatusIcon statusType={anomalies.some(a => a.type.toLowerCase().includes('edge')) ? 'fail' : 'pass'} />
                 <span className="font-bold">Edge & Corner Definition</span>
               </div>
               <p className="text-sm text-slate-400 pl-7">
                 {anomalies.find(a => a.type.toLowerCase().includes('edge'))?.description || "Edges and corners match CAD specifications."}
               </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
               <div className="flex items-center gap-3 mb-1">
                 <StatusIcon statusType={anomalies.some(a => a.type.toLowerCase().includes('surface')) ? 'fail' : 'pass'} />
                 <span className="font-bold">Surface Quality</span>
               </div>
               <p className="text-sm text-slate-400 pl-7">
                 {anomalies.find(a => a.type.toLowerCase().includes('surface'))?.description || "Surface finish meets quality standards."}
               </p>
            </div>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all text-lg shadow-lg border border-slate-600 mt-4"
          >
            Perform New Inspection
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b border-slate-700 pb-2">Reference Image</h3>
          <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl aspect-video bg-black">
             <img src={imageUrl} alt="Captured Metal" className="w-full h-full object-contain" />
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl text-xs text-slate-500 font-mono">
            TIMESTAMP: {new Date(result.timestamp).toLocaleString()}<br/>
            INSPECTION_ID: {result.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
