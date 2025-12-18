import { DomainType, Criterion } from "./types";

/**
 * Référentiel de compétences avec paliers d'observation.
 * Chaque critère est noté sur 20 points pour un total de 100 par domaine.
 */
export const DOMAIN_CRITERIA: Record<DomainType, { label: string; criteria: Criterion[] }> = {
  [DomainType.CLOSED_NOTION]: {
    label: "Notion Fermée / Règles",
    criteria: [
      {
        label: "Précision de la définition",
        levels: {
          0: "Termes approximatifs ou hors-sujet",
          10: "Définition correcte mais incomplète",
          20: "Usage exhaustif des termes techniques exacts"
        }
      },
      {
        label: "Conditions d'application",
        levels: {
          0: "Aucune condition identifiée",
          10: "Conditions citées mais sans hiérarchie",
          20: "Identification exhaustive des limites d'usage"
        }
      },
      {
        label: "Traitement des contre-exemples",
        levels: {
          0: "Contre-exemple ignoré ou validé à tort",
          10: "Contre-exemple identifié sans justification",
          20: "Invalidation argumentée du contre-exemple"
        }
      },
      {
        label: "Distinction conceptuelle",
        levels: {
          0: "Confusion entre le concept et l'exemple",
          10: "Distingue partiellement l'essence de la forme",
          20: "Abstraction réussie (le concept est extrait de l'exemple)"
        }
      },
      {
        label: "Rigueur syntaxique/métier",
        levels: {
          0: "Non-respect des règles de base",
          10: "Respect partiel (quelques erreurs)",
          20: "Maîtrise totale du formalisme disciplinaire"
        }
      }
    ]
  },
  [DomainType.DEBATE_THESIS]: {
    label: "Débat / Thèse / SHS",
    criteria: [
      {
        label: "Critique des prémisses",
        levels: {
          0: "Prémisses acceptées sans questionnement",
          10: "Identification d'un présupposé sans analyse",
          20: "Mise en question radicale et argumentée des bases"
        }
      },
      {
        label: "Force probante",
        levels: {
          0: "Opinion simple sans preuve",
          10: "Arguments cités mais peu étayés",
          20: "Preuves hiérarchisées et sourcées"
        }
      },
      {
        label: "Traitement des biais",
        levels: {
          0: "Soumission totale aux biais cognitifs",
          10: "Conscience des biais sans correction",
          20: "Dépassement actif des biais de confirmation"
        }
      },
      {
        label: "Décentrement (Perspective adverse)",
        levels: {
          0: "Incapacité à concevoir l'autre point de vue",
          10: "Reformulation de l'autre camp mais caricaturale",
          20: "Capacité à habiter et justifier la thèse adverse"
        }
      },
      {
        label: "Cohérence systémique",
        levels: {
          0: "Contradictions flagrantes non relevées",
          10: "Système logique stable mais fragile",
          20: "Architecture argumentative sans faille interne"
        }
      }
    ]
  },
  [DomainType.SCIENTIFIC_TECHNICAL]: {
    label: "Scientifique / Technique / Santé",
    criteria: [
      {
        label: "Recours aux données probantes (EBM/EBP)",
        levels: {
          0: "Aucune donnée ou anecdotes uniquement",
          10: "Données citées sans hiérarchie de preuve",
          20: "Données hiérarchisées (ex: Méta-analyse > Cohorte)"
        }
      },
      {
        label: "Analyse de causalité",
        levels: {
          0: "Confusion corrélation/causalité",
          10: "Identification des variables sans lien clair",
          20: "Démonstration des mécanismes de causalité"
        }
      },
      {
        label: "Périmètre de validité",
        levels: {
          0: "Généralisation abusive",
          10: "Périmètre cité mais non justifié",
          20: "Définition précise des conditions de validité"
        }
      },
      {
        label: "Doute méthodique (Réfutabilité)",
        levels: {
          0: "Certitude absolue sans vérification",
          10: "Acceptation du doute sans méthode",
          20: "Recherche active de la faille (critère de Popper)"
        }
      },
      {
        label: "Rigueur du protocole",
        levels: {
          0: "Protocole de vérification inexistant",
          10: "Protocole flou ou non reproductible",
          20: "Protocole opératoire, précis et disciplinaire"
        }
      }
    ]
  }
};
