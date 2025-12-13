import React from 'react';
import { BrainCircuit, X, MessageCircleQuestion, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" />
            Guide du Dialogue Évaluatif
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-slate-700">
          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-2">À quoi sert cet outil ?</h3>
            <p className="text-sm leading-relaxed">
              Le DES n'est pas un chatbot classique qui donne des réponses. C'est un <strong>outil d'évaluation de processus</strong>. 
              Il ne juge pas seulement ta réponse finale, mais la solidité de ton cheminement intellectuel : 
              comment tu justifies tes choix, comment tu réagis à la critique et comment tu détectes les erreurs.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <MessageCircleQuestion size={18} />
                Mode Tuteur·rice (Défense)
              </h4>
              <p className="text-xs text-indigo-800 leading-relaxed">
                <strong>Ton rôle :</strong> Défendre une thèse.<br/>
                <strong>Le rôle de l'IA :</strong> Avocat·e du diable.<br/>
                <strong>Objectif :</strong> L'IA va questionner tes méthodes et pointer tes faiblesses. Tu ne dois pas "satisfaire" l'IA, mais <strong>justifier</strong> rationnellement ta position sans céder à la facilité.
              </p>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <h4 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                <ShieldAlert size={18} />
                Mode Critique (Attaque)
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Ton rôle :</strong> Expert·e vérificateur·rice.<br/>
                <strong>Le rôle de l'IA :</strong> Générer du contenu plausible mais faillible.<br/>
                <strong>Objectif :</strong> L'IA va insérer des erreurs (biais, hallucinations, fautes logiques). Tu dois les <strong>détecter</strong> et expliquer pourquoi ce sont des erreurs.
              </p>
            </div>
          </div>

          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Comment seras-tu évalué·e ?</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 ml-2">
              <li><strong>Raisonnement :</strong> Ta logique est-elle cohérente ?</li>
              <li><strong>Processus :</strong> As-tu itéré et amélioré ta pensée ?</li>
              <li><strong>Métacognition :</strong> Sais-tu expliquer <em>comment</em> tu réfléchis ?</li>
              <li><strong>Promptographie :</strong> Es-tu transparent·e sur ton usage des outils ?</li>
            </ul>
          </section>
          
          <div className="bg-slate-100 p-4 rounded-lg text-xs text-slate-500 italic text-center">
            "Ce qui compte, ce n'est pas la réponse, c'est la preuve du travail de pensée."
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
