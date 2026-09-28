// VoiceGuard AI — Frontend API Service
// VITE_API_URL is the backend origin in production; leave unset for same-origin deployments.

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = envApiUrl ? envApiUrl.replace(/\/+$/, '') : '';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const WS_BASE_URL = (() => {
  const configuredWsUrl = import.meta.env.VITE_WS_URL?.trim();
  if (configuredWsUrl) {
    return configuredWsUrl.replace(/\/+$/, '');
  }
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8000';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:8000';
})();

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type ModelStatus = 'PRODUCTION_MODEL' | 'BASELINE_MODEL' | 'DEMO_MODE' | 'MODEL_UNAVAILABLE';

export interface AuthenticityMetrics {
  label: 'genuine' | 'synthetic' | 'suspicious' | 'unknown';
  classification: string;
  score: number | null;
  human_speech_probability: number | null;
  synthetic_speech_probability: number | null;
  replay_probability?: number | null;
  voice_conversion_probability?: number;
  confidence_interval?: string;
  model_confidence: number | null;
  measurements?: Record<string, number | null>;
}

export interface SpeakerVerificationResult {
  available: boolean;
  similarity: number | null;
  match: boolean | null;
  threshold: number;
  explanation: string;
}

export interface ReplayDetectionResult {
  available: boolean;
  probability: number | null;
  is_replay: boolean | null;
  measurements?: Record<string, number | null>;
  explanation: string;
}

export interface RiskEvaluation {
  score: number | null;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNAVAILABLE';
  factors: string[];
  recommendation: string;
}

export interface AudioAnalysisResult {
  status: 'success' | 'error';
  analysis_id: string;
  filename: string;
  file_size: number;
  duration: number;
  sample_rate: number;
  channels: number;
  file_hash: string;
  speech_duration: number;
  vad_score: number;
  detected_language: string | null;
  requested_language?: string;
  language_identification_available?: boolean;
  language_code: string;
  language_confidence?: number | null;
  transcript?: string | null;
  authenticity: AuthenticityMetrics;
  speaker_verification?: SpeakerVerificationResult;
  replay_detection?: ReplayDetectionResult;
  risk: RiskEvaluation;
  evidence: string[];
  recommendation: string;
  model_metadata: {
    engine_name: string;
    engine_version: string;
    status: ModelStatus;
    model_type: string;
    is_demo_mode: boolean;
  };
  processing_time_ms: number;
  confidence_disclaimer?: string;
  // Legacy aliases for backward compatibility with existing PDF & components:
  risk_engine?: {
    overall_risk_score: number;
    risk_level: string;
    primary_indicators: string[];
    recommendation: string;
  };
}

export interface CallShieldIncidentItem {
  id: string;
  category: string;
  caller_id: string | null;
  detected_language: string | null;
  language_code: string | null;
  deepfake_risk: number | null;
  threat_score: number | null;
  transcript_snippet: string | null;
  status: string;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  api_online: boolean;
  model_loaded: boolean;
  ai_engine_online: boolean;
  model_status: ModelStatus;
  model_version: string;
  active_modules: {
    audio_preprocessor: boolean;
    feature_extractor: boolean;
    authenticity_detector: boolean;
    speaker_verifier: boolean;
    replay_detector: boolean;
    risk_engine: boolean;
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(apiUrl('/api/health'));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: 'offline',
      service: 'voiceguard-ai',
      api_online: false,
      model_loaded: false,
      ai_engine_online: false,
      model_status: 'MODEL_UNAVAILABLE',
      model_version: 'VoiceGuard-v1.0.0-offline',
      active_modules: {
        audio_preprocessor: false,
        feature_extractor: false,
        authenticity_detector: false,
        speaker_verifier: false,
        replay_detector: false,
        risk_engine: false,
      },
    };
  }
}

export async function loginUser(email: string, password: string, remember: boolean) {
  try {
    const res = await fetch(apiUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: remember }),
    });
    return await res.json();
  } catch {
    return { error: 'Network error' };
  }
}

export async function analyzeAudioFile(
  file: File,
  language: string = 'auto',
  referenceSpeakerFile?: File,
): Promise<AudioAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (referenceSpeakerFile) {
    formData.append('reference_file', referenceSpeakerFile);
  }

  const res = await fetch(apiUrl('/api/analyze'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = `Analysis failed: HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  const data = await res.json();
  
  // Normalise legacy fields so components can access both formats
  if (!data.risk_engine && data.risk) {
    data.risk_engine = {
      overall_risk_score: data.risk.score,
      risk_level: data.risk.level,
      primary_indicators: data.evidence || data.risk.factors || [],
      recommendation: data.recommendation || data.risk.recommendation || '',
    };
  }

  return data;
}

export async function verifySpeaker(
  referenceFile: File,
  incomingFile: File,
  threshold: number = 0.75,
): Promise<SpeakerVerificationResult> {
  const formData = new FormData();
  formData.append('reference_file', referenceFile);
  formData.append('incoming_file', incomingFile);
  formData.append('threshold', threshold.toString());

  const res = await fetch(apiUrl('/api/verify-speaker'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let detail = `Speaker verification failed: HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j.detail) detail = j.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return await res.json();
}

export async function detectReplay(file: File): Promise<ReplayDetectionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl('/api/detect-replay'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let detail = `Replay detection failed: HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j.detail) detail = j.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return await res.json();
}

export async function fetchIncidents(): Promise<{
  incidents: CallShieldIncidentItem[];
  total_threats: number;
  demo_notice: string;
  demo_only?: boolean;
}> {
  try {
    const res = await fetch(apiUrl('/api/v1/call-shield/incidents'));
    if (res.ok) return await res.json();
  } catch {
    // Do not replace unavailable incident data with fabricated records.
  }
  return {
    total_threats: 0,
    incidents: [],
    demo_notice: 'Incident service is unavailable. No live incident data is being shown.',
    demo_only: false,
  };
}

export async function analyzeCallThreat(
  category: string,
  caller_phone: string,
  language: string,
  file?: File,
) {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('caller_phone', caller_phone);
  formData.append('language', language);
  if (file) formData.append('file', file);

  const res = await fetch(apiUrl('/api/v1/call-shield/analyze-threat'), {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    let detail = `Threat analysis failed: HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // Keep the HTTP status when the server did not return JSON.
    }
    throw new Error(detail);
  }
  return await res.json();
}

export async function fetchAnalysisHistory(): Promise<AudioAnalysisResult[]> {
  try {
    const res = await fetch(apiUrl('/api/history'));
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return [];
}
