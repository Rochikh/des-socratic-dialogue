
export enum AppMode {
  LOGIN = 'LOGIN',
  SETUP = 'SETUP',
  CHAT = 'CHAT',
  REPORT = 'REPORT'
}

export enum SocraticMode {
  TUTOR = 'TUTOR',
  CRITIC = 'CRITIC'
}

export enum DomainType {
  CLOSED_NOTION = "closed_notion",      
  DEBATE_THESIS = "debate_thesis",       
  SCIENTIFIC_TECHNICAL = "scientific_technical"
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  responseTimeMs?: number; // Nouveau : pour analyse temporelle
}

export interface SessionConfig {
  studentName: string;
  topic: string;
  mode: SocraticMode;
  domain: DomainType; // Nouveau : typage disciplinaire
}

export interface AnalysisData {
  summary: string;
  reasoningScore: number;
  clarityScore: number;
  skepticismScore: number;
  processScore: number;
  reflectionScore: number;
  disciplinaryDiscernmentScore: number; // Nouveau
  aiDeclarationCoherenceScore: number; // Nouveau
  keyStrengths: string[];
  weaknesses: string[];
  aiUsageAnalysis: string; // Nouveau
  transcript: Message[];
  aiDeclaration: string;
}
