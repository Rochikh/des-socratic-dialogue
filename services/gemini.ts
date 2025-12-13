import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Message, SocraticMode, AnalysisData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

export const createChatSession = (mode: SocraticMode, topic: string): Chat => {
  let systemInstruction = "";
  const tone = "Tu dois impérativement TUTOYER l'étudiant·e.";
  
  if (mode === SocraticMode.TUTOR) {
    systemInstruction = `Rôle: Tuteur Socratique. Sujet: ${topic}. ${tone} Ne donne jamais la réponse. Questionne le processus.`;
  } else {
    systemInstruction = `Rôle: IA faillible pour critique. Sujet: ${topic}. ${tone} Fais des erreurs subtiles pour tester la vigilance.`;
  }
  return ai.chats.create({ model: MODEL_NAME, config: { systemInstruction } });
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "Erreur.";
  } catch (error) { return "Erreur de communication."; }
};

export const generateAnalysis = async (transcript: Message[], topic: string, aiDeclaration: string): Promise<AnalysisData> => {
  const prompt = `Analyse cette session (Sujet: ${topic}). Déclaration: ${aiDeclaration}. Transcript: ${JSON.stringify(transcript)}. Retourne un JSON avec scores et analyse.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            reasoningScore: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            skepticismScore: { type: Type.INTEGER },
            processScore: { type: Type.INTEGER },
            reflectionScore: { type: Type.INTEGER },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { summary: "Erreur", reasoningScore: 0, clarityScore: 0, skepticismScore: 0, processScore: 0, reflectionScore: 0, keyStrengths: [], weaknesses: [], transcript, aiDeclaration };
  }
};
