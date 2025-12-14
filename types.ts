
export enum AppMode {
  LOGIN = 'LOGIN', // Nouvelle étape de sécurité
  SETUP = 'SETUP',
  CHAT = 'CHAT',
  REPORT = 'REPORT'
}

export enum SocraticMode {
  TUTOR = 'TUTOR', // Le tuteur socratique classique (Processus & Justification)
  CRITIC = 'CRITIC' // L'étudiant critique l'IA (Vigilance & Vérification)
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SessionConfig {
  studentName: string;
  topic: string;
  mode: SocraticMode;
}

export interface AnalysisData {
  summary: string;
  reasoningScore: number; // 0-100
  clarityScore: number; // 0-100
  skepticismScore: number; // 0-100
  processScore: number; // 0-100 (Nouveau : Trace d'apprentissage / Itération)
  reflectionScore: number; // 0-100 (Nouveau : Métacognition / Journal de bord)
  keyStrengths: string[];
  weaknesses: string[];
  transcript: Message[];
  aiDeclaration: string; // La déclaration d'usage / Promptographie
}
