
export type QAStatus = 'QA_PASSED' | 'QA_FAILED';

export interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
}

export interface InspectionResult {
  id: string;
  status: QAStatus;
  confidence: number;
  anomalies: Anomaly[];
  summary: string;
  timestamp: string;
}

export interface ShiftStats {
  totalInspected: number;
  passed: number;
  failed: number;
  anomalyCounts: Record<string, number>;
}

export interface AppState {
  view: 'LOGIN' | 'DASHBOARD' | 'SETUP' | 'INSPECT';
  supervisor: string | null;
  cadImage: string | null; // Reference
  currentInspection: {
    actualImage: string | null;
    result: InspectionResult | null;
    isAnalyzing: boolean;
  };
  history: InspectionResult[];
}
