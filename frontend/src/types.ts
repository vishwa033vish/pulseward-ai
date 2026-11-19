export type Category =
  | 'road_damage'
  | 'garbage'
  | 'water_leak'
  | 'streetlight'
  | 'drainage'
  | 'infrastructure';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Status = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';

export type Severity = 'Low' | 'Moderate' | 'Severe' | 'Critical';

export type Language = 'en' | 'ta';

export type Role = 'citizen' | 'admin';

export interface AnalysisSource {
  /** 'gemini' = real multimodal model, 'demo' = local heuristic demo analyzer */
  engine: 'gemini' | 'demo';
  model?: string;
}

export interface AiAnalysis {
  category: Category;
  description: string;
  evidence: string[];
  severity: Severity;
  suggestedPriority: Priority;
  recommendedAction: string;
  /** 0..1, only when the engine can produce a meaningful estimate. */
  confidence: number | null;
  /** True when the assessment is a demo heuristic rather than a real model call. */
  isEstimate: boolean;
  source: AnalysisSource;
  disclaimer: string;
  createdAt: string;
}

export interface PriorityAssessment {
  priority: Priority;
  score: number;
  reasons: string[];
  factors: {
    categoryWeight: number;
    severityWeight: number;
    safetyImpact: number;
    nearbyReports: number;
    essentialInfrastructure: boolean;
  };
}

export interface StatusEvent {
  status: Status;
  at: string;
  note?: string;
}

export interface Report {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  priority_score: number;
  priority_reasons: string[];
  status: Status;
  latitude: number;
  longitude: number;
  area: string;
  image_url: string | null;
  ai_analysis: AiAnalysis | null;
  department: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
  status_history: StatusEvent[];
}

export interface Profile {
  id: string;
  display_name: string;
  preferred_language: Language;
  role: Role;
  created_at: string;
  is_demo: boolean;
}

export interface Department {
  id: string;
  department_name: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  at: string;
  engine?: 'gemini' | 'demo';
}

export interface Draft {
  imageDataUrl: string | null;
  analysis: AiAnalysis | null;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  latitude: number | null;
  longitude: number | null;
  area: string;
  savedAt?: string;
}
