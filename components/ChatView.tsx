import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Message, SocraticMode, AnalysisData, DomainType } from "../types";
import { DOMAIN_CRITERIA } from "../domainCriteria";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CHAT_MODEL = "gemini-3-flash-preview";
const ANALYSIS_MODEL = "gemini-3-pro-preview";
const TUTOR_NAME = "ARGOS";

export const createChatSession = (mode: SocraticMode, topic: string, history: Message[] = [], domain: DomainType = DomainType.DEBATE_THESIS): Chat => {
  const domainInfo = DOMAIN_CRITERIA[domain];
  const systemInstruction = `
Tu es ${TUTOR_NAME}, un tuteur socratique expert en pensée critique. Sujet : "${topic}". Domaine : "${domainInfo.label}".

OBJECTIF : Évaluer la capacité de l'étudiant à raisonner par lui-même.
CRITÈRES DISCIPLINAIRES : ${domainInfo.criteria.join(", ")}.

MÉTHODE :
- Tutoiement. Style sobre, direct, légèrement sceptique.
- Ne donne JAMAIS la réponse.
- Pose une seule question à la fois pour pousser l'étudiant dans ses retranchements.
- Mode ${mode === SocraticMode.TUTOR ? 'DÉFENSE : l\'étudiant défend une thèse' : 'CRITIQUE : l\'étudiant doit trouver les failles d\'un texte que tu lui proposes'}.

STRUCTURE : À partir de la phase 2, ajoute systématiquement en fin de message :
Exigence : [ce qu'on attend de l'étudiant maintenant]
Contrôle : [la règle logique à ne pas briser]
  `.trim();

  return ai.chats.create({
    model: CHAT_MODEL,
    history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: { 
      systemInstruction, 
      temperature: 0.7 
    }
  });
};

export const sendMessage = async (chat: Chat, message: string) => {
  try {
    const response = await chat.sendMessage({ message });
    const text = response.text || "Désolé, j'ai rencontré une erreur de génération.";
    return { text };
  } catch (e) {
    console.error("Gemini Error:", e);
    return { text: "Erreur de connexion avec l'agent Argos. Vérifie ta connexion." };
  }
};

export const generateAnalysis = async (
  transcript: Message[],
  topic: string,
  aiDeclaration: string,
  domain: DomainType = DomainType.DEBATE_THESIS
): Promise<AnalysisData> => {
  const domainInfo = DOMAIN_CRITERIA[domain];
  const transcriptText = transcript.map(m => `[${m.role === "user" ? "Étudiant" : TUTOR_NAME}]: ${m.text}`).join("\n");

  const prompt = `
Analyse ce dialogue socratique sur "${topic}" (Domaine: ${domainInfo.label}).
L'étudiant déclare ceci sur son usage de l'IA : "${aiDeclaration}"

Transcription :
${transcriptText}

Évalue sur 100 :
1. "disciplinaryDiscernmentScore" : Maîtrise des critères : ${domainInfo.criteria.join(", ")}.
2. "aiDeclarationCoherenceScore" : Sincérité de l'étudiant (vitesse de réponse, style).

Réponds au format JSON strict.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
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
            disciplinaryDiscernmentScore: { type: Type.INTEGER },
            aiDeclarationCoherenceScore: { type: Type.INTEGER },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiUsageAnalysis: { type: Type.STRING }
          },
          required: ["summary", "disciplinaryDiscernmentScore", "aiDeclarationCoherenceScore", "keyStrengths", "weaknesses", "aiUsageAnalysis"]
        }
      }
    });

    return { ...JSON.parse(response.text), transcript, aiDeclaration };
  } catch (e) {
    return { 
      summary: "Échec de l'analyse automatique.", 
      reasoningScore: 50, clarityScore: 50, skepticismScore: 50, processScore: 50, reflectionScore: 50, 
      disciplinaryDiscernmentScore: 0, aiDeclarationCoherenceScore: 0, 
      keyStrengths: [], weaknesses: [], aiUsageAnalysis: "Impossible d'analyser la session.", 
      transcript, aiDeclaration 
    };
  }
};
