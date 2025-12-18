import { DomainType } from "./types";

export const DOMAIN_CRITERIA: Record<DomainType, { label: string; criteria: string[] }> = {
  [DomainType.CLOSED_NOTION]: {
    label: "Notion Fermée / Règles",
    criteria: [
      "Précision de la définition technique",
      "Identification des conditions d'application",
      "Traitement rigoureux des contre-exemples",
      "Distinction entre le concept et l'exemple",
      "Respect du formalisme disciplinaire"
    ]
  },
  [DomainType.DEBATE_THESIS]: {
    label: "Débat / Thèse / SHS",
    criteria: [
      "Mise en question des prémisses et présupposés",
      "Qualité et hiérarchisation des preuves (Force probante)",
      "Identification et dépassement des biais cognitifs",
      "Capacité de décentrement (compréhension de la thèse adverse)",
      "Cohérence logique globale du système argumentatif"
    ]
  },
  [DomainType.SCIENTIFIC_TECHNICAL]: {
    label: "Scientifique / Technique / Santé",
    criteria: [
      "Recours systématique aux données probantes (EBM/EBP)",
      "Rigueur dans l'analyse de causalité (vs corrélation)",
      "Définition précise du périmètre de validité",
      "Doute méthodique et recherche de réfutabilité",
      "Précision du protocole de vérification"
    ]
  }
};
