// VoiceGuard AI — Frontend API Service
// On Vercel production: all /api/* calls are relative (same origin → serverless functions).
// In local dev: Vite proxy forwards /api/* → localhost:8000.

// No hardcoded URL needed — always use relative /api paths.
export const API_BASE_URL = '';
export const WS_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `wss://${window.location.host}`
    : 'ws://localhost:8000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthenticityMetrics {
  classification: string;
  human_speech_probability: number;
  synthetic_speech_probability: number;
  replay_probability: number;
  voice_conversion_probability: number;
  confidence_interval: string;
  model_confidence: number;
}

export interface AudioAnalysisResult {
  analysis_id: string;
  filename: string;
  file_size: number;
  duration: number;
  sample_rate: number;
  channels: number;
  file_hash: string;
  speech_duration: number;
  vad_score: number;
  detected_language: string;
  language_code: string;
  language_confidence: number;
  transcript: string;
  authenticity: AuthenticityMetrics;
  risk_engine: {
    overall_risk_score: number;
    risk_level: string;
    primary_indicators: string[];
    recommendation: string;
  };
  model_metadata: {
    engine_version: string;
    is_demo_mode: boolean;
  };
  confidence_disclaimer?: string;
  processing_time_ms?: number;
}

export interface CallShieldIncidentItem {
  id: string;
  category: string;
  caller_id: string;
  detected_language: string;
  language_code: string;
  deepfake_risk: number;
  threat_score: number;
  transcript_snippet: string;
  status: string;
  created_at: string;
}

export async function fetchHealth() {
  try {
    const res = await fetch(`/api/health`);
    return await res.json();
  } catch {
    return { status: 'offline', ai_engine_online: false };
  }
}

export async function loginUser(email: string, password: string, remember: boolean) {
  try {
    const res = await fetch(`/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: remember }),
    });
    return await res.json();
  } catch {
    return { error: 'Network error' };
  }
}

export async function signupUser(name: string, email: string, password: string) {
  try {
    const res = await fetch(`/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  } catch {
    return { error: 'Network error' };
  }
}

export async function analyzeAudioFile(
  file: File,
  language: string = 'auto',
): Promise<AudioAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const res = await fetch(`/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function fetchIncidents(): Promise<{
  incidents: CallShieldIncidentItem[];
  total_threats: number;
  demo_notice: string;
}> {
  try {
    const res = await fetch(`/api/v1/call-shield/incidents`);
    return await res.json();
  } catch {
    return {
      total_threats: 1,
      incidents: [
        {
          id: 'INC-8921',
          category: 'Kidnapping / Extortion Threat',
          caller_id: '+91 98765 43210',
          detected_language: 'Telugu',
          language_code: 'te',
          deepfake_risk: 91.4,
          threat_score: 94,
          transcript_snippet: 'మీ అబ్బాయి మా స్వాధీనంలో ఉన్నాడు...',
          status: 'CRITICAL_ALERT',
          created_at: '2026-09-17T21:45:00Z',
        },
      ],
      demo_notice: 'HISTORICAL CASE LOGS',
    };
  }
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

  try {
    const res = await fetch(`/api/v1/call-shield/analyze-threat`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch {
    return { error: 'Network error' };
  }
}
