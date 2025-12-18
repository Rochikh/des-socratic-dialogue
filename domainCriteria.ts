import { DomainType } from "./types";

/**
 * Référentiel de compétences et indicateurs observables par domaine.
 * Ces critères servent de base de notation pour le score de "Discernement Disciplinaire".
 */
export const DOMAIN_CRITERIA: Record<DomainType, { label: string; criteria: string[] }> = {
  [DomainType.CLOSED_NOTION]: {
    label: "Notion Fermée / Règles",
    criteria: [
      "Précision de la définition (usage des termes exacts)",
      "Identification exhaustive des conditions d'application",
      "Capacité à identifier un contre-exemple invalide",
      "Distinguer le concept de ses illustrations superficielles",
      "Respect strict de la syntaxe ou du protocole métier"
    ]
  },
  [DomainType.DEBATE_THESIS]: {
    label: "Débat / Thèse / SHS",
    criteria: [
      "Identification et critique des prémisses (présupposés)",
      "Évaluation de la force probante des arguments mobilisés",
      "Reconnaissance et traitement des biais cognitifs (confirmation, ancrage)",
      "Capacité à habiter la perspective adverse (décentrement)",
      "Cohérence logique du système argumentatif global"
    ]
  },
  [DomainType.SCIENTIFIC_TECHNICAL]: {
    label: "Scientifique / Technique / Santé",
    criteria: [
      "Recours aux données probantes (Evidence-Based)",
      "Identification des variables et des liens de causalité",
      "Précision du périmètre de validité d'une affirmation",
      "Usage du doute méthodique (réfutabilité de Popper)",
      "Rigueur de la méthodologie de vérification proposée"
    ]
  }
};
