
import { GoogleGenAI, Chat, Type, Content } from "@google/genai";
import { Message, SocraticMode, AnalysisData, DomainType } from "../types";
import { DOMAIN_CRITERIA } from "../domainCriteria";

/**
 * Ne jamais exposer la clé côté navigateur.
 * process.env.API_KEY doit être fourni côté serveur.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Modèle FORCE : gemini-3-pro-preview for complex reasoning tasks.
 */
const MODEL_NAME = "gemini-3-pro-preview";

/** Réglages */
const CHAT_TEMPERATURE = Number(process.env.GENAI_CHAT_TEMPERATURE ?? 0.7);
const ANALYSIS_TEMPERATURE = Number(process.env.GENAI_ANALYSIS_TEMPERATURE ?? 0.3);

/** Nom neutre */
const TUTOR_NAME = process.env.DES_TUTOR_NAME || "ARGOS";

/** Tampon de version */
export const PROMPT_VERSION =
  process.env.DES_PROMPT_VERSION ||
  "2025-12-19_argos_v8_structured_criteria";

/** Configuration retry */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

/** Limites validation */
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

/**
 * Configuration des défauts par type de domaine (mode AUDIT)
 */
const DOMAIN_DEFECT_CONFIG: Record<DomainType, { types: string[]; description: string }> = {
  [DomainType.CLOSED_NOTION]: {
    types: ["définition inexacte", "condition d'usage erronée", "contre-exemple ignoré"],
    description: "erreurs sur règles, définitions ou conditions d'application"
  },
  [DomainType.DEBATE_THESIS]: {
    types: ["factuel", "logique", "généralisation abusive"],
    description: "erreurs factuelles, logiques ou de généralisation"
  },
  [DomainType.SCIENTIFIC_TECHNICAL]: {
    types: ["donnée erronée", "causalité non prouvée", "périmètre de validité ignoré"],
    description: "erreurs sur données, causalités ou conditions de validité"
  }
};

/**
 * Thinking budget adaptatif selon le type de domaine
 */
const getThinkingBudget = (domain: DomainType, isAnalysis: boolean): number => {
  const baseMultiplier = isAnalysis ? 2 : 1;
  switch (domain) {
    case DomainType.CLOSED_NOTION:
      return 1024 * baseMultiplier;
    case DomainType.DEBATE_THESIS:
      return 2048 * baseMultiplier;
    case DomainType.SCIENTIFIC_TECHNICAL:
      return 3072 * baseMultiplier;
    default:
      return 2048 * baseMultiplier;
  }
};

/**
 * Retry avec backoff exponentiel
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Timeout wrapper
 */
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout après ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Validation des entrées
 */
const validateInput = (message: string): { valid: boolean; error?: string } => {
  if (!message || message.trim().length < MIN_MESSAGE_LENGTH) return { valid: false, error: "Message vide." };
  if (message.length > MAX_MESSAGE_LENGTH) return { valid: false, error: "Message trop long." };
  return { valid: true };
};

/**
 * Construction du système commun
 */
const buildCommonSystem = (topic: string, domain: DomainType) => {
  const criteria = DOMAIN_CRITERIA[domain];
  
  return `
IDENTITÉ : Tu es ${TUTOR_NAME}, agent du Dialogue Évaluatif Socratique. Sujet : "${topic}". Domaine : "${criteria.label}".

RÉFÉRENTIEL DISCIPLINAIRE (À OBSERVER) :
L'étudiant·e doit démontrer sa maîtrise des critères suivants propres à la discipline :
${criteria.criteria.map(c => `- ${c}`).join("\n")}

TON & LANGUE : Tutoiement, français, sobre, sceptique. Jamais de compliments.

PRINCIPE D'ÉVALUATION :
- Identifie l'intention : Explorer (flou), Vérifier (demande de validation), Défendre (thèse).
- Appuie-toi sur les critères ci-dessus pour poser tes questions.
- Si l'étudiant·e reste au niveau "sens commun", pousse-le vers l'un des critères disciplinaires.

CONTRÔLE :
- Une seule question par message. 
- Longueur : 70-140 mots.
- Interdit de donner la réponse.
- Trace obligatoire (Phases 2+) sur 2 lignes : "Exigence:" et "Contrôle:".

ANTI-GAMING : Détecte les copier-coller ou les réponses trop rapides par rapport à la complexité demandée.
  `.trim();
};

/**
 * Systèmes spécifiques
 */
const buildTutorSystem = (topic: string, domain: DomainType) => `
${buildCommonSystem(topic, domain)}
MODE : DÉFENSE. Objectif : éprouver la solidité du raisonnement de l'étudiant·e sur les critères disciplinaires cités.
`;

const buildCriticSystem = (topic: string, domain: DomainType) => {
  const defectConfig = DOMAIN_DEFECT_CONFIG[domain];
  return `
${buildCommonSystem(topic, domain)}
MODE : AUDIT. Produis un texte plausible avec 3 défauts de type : ${defectConfig.types.join(", ")}.
Force l'étudiant·e à proposer des protocoles de vérification ancrés dans les critères disciplinaires.
`;
};

/**
 * Envoi de message
 */
export const sendMessage = async (chat: Chat, message: string, messageTimestamp?: number) => {
  const validation = validateInput(message);
  if (!validation.valid) return { text: validation.error! };

  try {
    const response = await withRetry(() => withTimeout(chat.sendMessage({ message })));
    const responseTimeMs = messageTimestamp ? Date.now() - messageTimestamp : undefined;
    return { text: response.text || "Erreur.", responseTimeMs };
  } catch (e) {
    return { text: "Erreur technique." };
  }
};

/**
 * Analyse finale
 */
export const generateAnalysis = async (
  transcript: Message[],
  topic: string,
  aiDeclaration: string,
  domain: DomainType = DomainType.DEBATE_THESIS
): Promise<AnalysisData> => {
  const criteria = DOMAIN_CRITERIA[domain];
  const transcriptText = transcript.map(m => `[${m.role === "user" ? "Étudiant" : TUTOR_NAME}]: ${m.text}`).join("\n");

  const prompt = `
Analyse le processus réflexif ci-dessous pour le sujet "${topic}" (Domaine: ${criteria.label}).

CRITÈRES DISCIPLINAIRES DE RÉFÉRENCE :
${criteria.criteria.map(c => `- ${c}`).join("\n")}

DÉCLARATION IA : "${aiDeclaration}"

TRANSCRIPTION :
${transcriptText}

TA MISSION :
1. Calcule le score "disciplinaryDiscernmentScore" (0-100). Chaque critère du référentiel ci-dessus démontré par l'étudiant·e ajoute 20 points.
2. Évalue la cohérence entre la déclaration IA et les traces observées (style, rapidité, tournures).
3. Produis une synthèse de 180 mots valorisant le cheminement intellectuel.

SORTIE JSON UNIQUE :
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
          required: ["summary", "reasoningScore", "disciplinaryDiscernmentScore", "aiDeclarationCoherenceScore", "keyStrengths", "weaknesses", "aiUsageAnalysis"]
        }
      }
    });

    return { ...JSON.parse(response.text), transcript, aiDeclaration };
  } catch (e) {
    console.error(e);
    return { summary: "Erreur analyse.", reasoningScore: 0, clarityScore: 0, skepticismScore: 0, processScore: 0, reflectionScore: 0, disciplinaryDiscernmentScore: 0, aiDeclarationCoherenceScore: 0, keyStrengths: [], weaknesses: [], aiUsageAnalysis: "Erreur.", transcript, aiDeclaration };
  }
};

/**
 * Initialisation
 */
export const createChatSession = (mode: SocraticMode, topic: string, history: Message[] = [], domain: DomainType = DomainType.DEBATE_THESIS): Chat => {
  const systemInstruction = mode === SocraticMode.TUTOR ? buildTutorSystem(topic, domain) : buildCriticSystem(topic, domain);
  return ai.chats.create({
    model: MODEL_NAME,
    history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: { systemInstruction, temperature: CHAT_TEMPERATURE, thinkingConfig: { thinkingBudget: getThinkingBudget(domain, false) } }
  });
};
