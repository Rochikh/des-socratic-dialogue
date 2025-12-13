import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Message, SocraticMode, AnalysisData } from "../types";

// Initialize client with process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Initializes a chat session with specific system instructions based on the selected mode.
 */
export const createChatSession = (mode: SocraticMode, topic: string): Chat => {
  let systemInstruction = "";

  const toneInstruction = "TON ET FORMULATION : Tu dois impérativement TUTOYER l'étudiant·e. Utilise l'écriture inclusive (point médian) lorsque c'est nécessaire (ex: étudiant·e, expert·e, sûr·e). Sois bienveillant·e mais exigeant·e.";

  if (mode === SocraticMode.TUTOR) {
    systemInstruction = `
      Vous êtes le "Dialogue Évaluatif Socratique" (DES).
      Votre rôle : Tuteur·rice exigeant·e axé·e sur le PROCESSUS et la MÉTACOGNITION.
      Sujet : ${topic}.
      
      ${toneInstruction}
      
      Protocole pédagogique strict :
      1. DEMANDE D'ÉBAUCHE : Ne demande pas une réponse finale. Demande d'abord un plan, une première ébauche ou une hypothèse de travail.
      2. JUSTIFICATION MÉTHODOLOGIQUE : Pour chaque affirmation de l'étudiant·e, demande "Pourquoi as-tu choisi cette approche ?" ou "Sur quelle preuve repose ce choix ?". Force l'étudiant·e à rendre sa pensée visible.
      3. CONTRADICTION (DÉFENSE ORALE) : Adopte une posture contradictoire. Attaque les points faibles de son raisonnement pour simuler une défense orale. L'étudiant·e doit défendre ses choix "sur le vif".
      4. JOURNAL RÉFLEXIF : Demande régulièrement : "As-tu changé d'avis par rapport à ton idée initiale ? Pourquoi ?".
      
      Ne donne JAMAIS la réponse. Évalue la méthode, pas juste le résultat.
      Commence par demander à l'étudiant·e de proposer une première piste de réflexion ou un plan sur le sujet.
    `;
  } else {
    systemInstruction = `
      Vous êtes le "Dialogue Évaluatif Socratique" (DES) en mode "IA-Formateur / Littératie Critique".
      Votre rôle : Générer du contenu plausible mais faillible pour tester la VIGILANCE ÉPISTÉMIQUE de l'étudiant·e.
      Sujet : ${topic}.
      
      ${toneInstruction}
      
      Protocole pédagogique strict :
      1. LE PIÈGE : Génère une analyse détaillée sur le sujet qui contient des erreurs subtiles (biais logique, hallucination factuelle crédible, ou généralisation abusive).
      2. LA CONSIGNE : Demande à l'étudiant·e d'agir comme un·e expert·e qui doit valider ce contenu avant publication. Demande-lui de vérifier les faits et d'identifier les biais.
      3. VÉRIFICATION : Si l'étudiant·e corrige une erreur, demande-lui : "Quelles sources as-tu consultées pour vérifier cela ?" ou "Comment sais-tu que c'est faux ?".
      4. RESPONSABILITÉ : Pousse l'étudiant·e à critiquer la "boîte noire" de l'IA.
      
      Commence par soumettre ton analyse (imparfaite) à l'étudiant·e.
    `;
  }

  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction.trim(),
    },
  });
};

/**
 * Sends a message to the active chat session.
 */
export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "Erreur de génération de réponse.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "Une erreur est survenue lors de la communication avec l'IA.";
  }
};

/**
 * Analyzes the entire transcript to generate a pedagogical report.
 */
export const generateAnalysis = async (transcript: Message[], topic: string, aiDeclaration: string): Promise<AnalysisData> => {
  const transcriptText = transcript
    .map((m) => `[${m.role === 'user' ? 'Étudiant·e' : 'DES'}]: ${m.text}`)
    .join('\n');

  const prompt = `
    Tu es un Expert Pédagogique Francophone.
    Ta mission est d'évaluer une session de Dialogue Évaluatif Socratique.

    Sujet : "${topic}".
    Déclaration de l'étudiant·e : "${aiDeclaration}"
    Transcript :
    ${transcriptText}

    CONSIGNE ABSOLUE DE LANGUE :
    Toutes les valeurs textuelles du JSON doivent être rédigées en FRANÇAIS, même si les clés sont en anglais.
    Utilise le tutoiement et l'écriture inclusive.

    OBJECTIFS D'ANALYSE :
    1. Itération : L'étudiant·e a-t-il·elle affiné sa pensée ?
    2. Justification : L'étudiant·e a-t-il·elle expliqué le "pourquoi" de ses choix ?
    3. Critique : L'étudiant·e a-t-il·elle remis en cause l'IA ou ses propres biais ?
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING,
              description: "Résumé narratif pédagogique détaillé, impérativement rédigé en FRANÇAIS." 
            },
            reasoningScore: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            skepticismScore: { type: Type.INTEGER },
            processScore: { type: Type.INTEGER },
            reflectionScore: { type: Type.INTEGER },
            keyStrengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Liste des points forts identifiés, rédigés en FRANÇAIS."
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Liste des points d'amélioration, rédigés en FRANÇAIS."
            },
          },
          required: ["summary", "reasoningScore", "clarityScore", "skepticismScore", "processScore", "reflectionScore", "keyStrengths", "weaknesses"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        transcript,
        aiDeclaration
      };
    }
    throw new Error("Empty response from analysis");

  } catch (error) {
    console.error("Analysis generation failed:", error);
    return {
      summary: "L'analyse automatique n'a pas pu être générée.",
      reasoningScore: 0,
      clarityScore: 0,
      skepticismScore: 0,
      processScore: 0,
      reflectionScore: 0,
      keyStrengths: ["N/A"],
      weaknesses: ["Erreur technique lors de l'analyse"],
      transcript,
      aiDeclaration
    };
  }
};
