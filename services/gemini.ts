import { GoogleGenAI, Chat, Type, Content } from "@google/genai";
import { Message, SocraticMode, AnalysisData, DomainType } from "../types";
import { DOMAIN_CRITERIA } from "../domainCriteria";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-pro-preview";
const CHAT_TEMPERATURE = 0.7;
const ANALYSIS_TEMPERATURE = 0.3;
const TUTOR_NAME = "ARGOS";

const getThinkingBudget = (domain: DomainType, isAnalysis: boolean): number => {
  const base = isAnalysis ? 2 : 1;
  if (domain === DomainType.SCIENTIFIC_TECHNICAL) return 3072 * base;
  if (domain === DomainType.DEBATE_THESIS) return 2048 * base;
  return 1024 * base;
};

export const createChatSession = (mode: SocraticMode, topic: string, history: Message[] = [], domain: DomainType = DomainType.DEBATE_THESIS): Chat => {
  const criteria = DOMAIN_CRITERIA[domain];
  const systemInstruction = `
IDENTITÉ : Tu es ${TUTOR_NAME}, agent du Dialogue Évaluatif Socratique. Sujet : "${topic}". Domaine : "${criteria.label}".

RÉFÉRENTIEL DISCIPLINAIRE (CRITÈRES À ÉPROUVER) :
${criteria.criteria.map(c => `- ${c.label} (Niveaux attendus : ${c.levels[10]} ou ${c.levels[20]})`).join("\n")}

TON : Tutoiement, sobre, sceptique. Jamais de compliments.

MODE : ${mode === SocraticMode.TUTOR ? 'DÉFENSE (pousser l\'élève à justifier)' : 'AUDIT (proposer un texte à corriger)'}.

CONTRÔLE : Une seule question par message. Longueur 70-140 mots. Trace obligatoire (Phases 2+) sur 2 lignes : "Exigence:" et "Contrôle:".
  `.trim();

  return ai.chats.create({
    model: MODEL_NAME,
    history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: { systemInstruction, temperature: CHAT_TEMPERATURE, thinkingConfig: { thinkingBudget: getThinkingBudget(domain, false) } }
  });
};

export const sendMessage = async (chat: Chat, message: string) => {
  try {
    const response = await chat.sendMessage({ message });
    return { text: response.text || "Erreur." };
  } catch (e) {
    return { text: "Erreur technique." };
  }
};

export const generateAnalysis = async (
  transcript: Message[],
  topic: string,
  aiDeclaration: string,
  domain: DomainType = DomainType.DEBATE_THESIS
): Promise<AnalysisData> => {
  const criteria = DOMAIN_CRITERIA[domain];
  const transcriptText = transcript.map(m => {
    const time = m.responseTimeMs ? ` [Réflexion: ${Math.round(m.responseTimeMs / 1000)}s]` : "";
    return `[${m.role === "user" ? "Étudiant" : TUTOR_NAME}]${time}: ${m.text}`;
  }).join("\n");

  const prompt = `
Analyse ce Dialogue Évaluatif Socratique sur "${topic}".

GRILLE DISCIPLINAIRE DE RÉFÉRENCE (Score sur 100) :
Pour chaque critère, attribue 0, 10 ou 20 points selon les paliers suivants :
${criteria.criteria.map(c => `- ${c.label} :
    - 0 pt : ${c.levels[0]}
    - 10 pts : ${c.levels[10]}
    - 20 pts : ${c.levels[20]}`).join("\n")}

DÉCLARATION IA : "${aiDeclaration}"

TRANSCRIPTION :
${transcriptText}

TA MISSION :
1. "disciplinaryDiscernmentScore" : Somme des points (0, 10 ou 20) pour les 5 critères ci-dessus. Justifie chaque point par un indice précis.
2. "aiDeclarationCoherenceScore" : Évalue si l'élève a utilisé l'IA sans le dire. Indice : réponses complexes en moins de 5 secondes, style trop policé, structure GPT.
3. Synthèse (summary) : 180 mots valorisant le processus.

SORTIE JSON :
{
  "summary": string,
  "reasoningScore": int,
  "clarityScore": int,
  "skepticismScore": int,
  "processScore": int,
  "reflectionScore": int,
  "disciplinaryDiscernmentScore": int,
  "aiDeclarationCoherenceScore": int,
  "keyStrengths": string[],
  "weaknesses": string[],
  "aiUsageAnalysis": string
}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: ANALYSIS_TEMPERATURE,
        thinkingConfig: { thinkingBudget: getThinkingBudget(domain, true) },
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
    console.error(e);
    return { summary: "Erreur analyse.", reasoningScore: 0, clarityScore: 0, skepticismScore: 0, processScore: 0, reflectionScore: 0, disciplinaryDiscernmentScore: 0, aiDeclarationCoherenceScore: 0, keyStrengths: [], weaknesses: [], aiUsageAnalysis: "Erreur.", transcript, aiDeclaration };
  }
};
