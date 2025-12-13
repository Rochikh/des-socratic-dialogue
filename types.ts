export enum AppMode { SETUP = 'SETUP', CHAT = 'CHAT', REPORT = 'REPORT' }
export enum SocraticMode { TUTOR = 'TUTOR', CRITIC = 'CRITIC' }
export interface Message { id: string; role: 'user' | 'model'; text: string; timestamp: number; }
export interface SessionConfig { studentName: string; topic: string; mode: SocraticMode; }
export interface AnalysisData {
  summary: string;
  reasoningScore: number; clarityScore: number; skepticismScore: number; processScore: number; reflectionScore: number;
  keyStrengths: string[]; weaknesses: string[];
  transcript: Message[]; aiDeclaration: string;
}
