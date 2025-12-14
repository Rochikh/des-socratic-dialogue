import React from 'react';
import { BrainCircuit, X, MessageCircleQuestion, ShieldAlert, Lock, Database, Save, Download, Upload } from 'lucide-react';

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
          
          {/* Section Confidentialité / RGPD */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Lock size={16} className="text-emerald-600" /> Confidentialité & Données (RGPD)
            </h3>
            <div className="text-xs text-slate-600 space-y-2">
              <p className="flex items-start gap-2">
                <Database size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  <strong>Aucun stockage serveur :</strong> Cette application est "stateless". Aucune conversation, aucun nom ni aucune donnée n'est sauvegardé sur nos serveurs.
                </span>
              </p>
              <p>
                <strong>Données volatiles :</strong> Toutes les données résident uniquement dans la mémoire vive de votre appareil. <strong>Si vous rafraîchissez la page ou fermez l'onglet, tout est définitivement effacé.</strong>
              </p>
              <p>
                <strong>Sous-traitance IA :</strong> Les échanges sont traités par l'API Google Gemini. Nous vous conseillons de ne jamais partager d'informations personnelles sensibles.
              </p>
            </div>
          </section>

          {/* NOUVELLE SECTION : Sauvegarde et Reprise */}
          <section className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Save size={16} className="text-blue-600" /> Sauvegarder & Reprendre sa session
            </h3>
            <div className="text-xs text-blue-800 space-y-3">
              <p>Comme nous ne stockons rien, tu es responsable de la sauvegarde de ton travail si tu dois t'interrompre.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/60 p-2 rounded border border-blue-100">
                  <strong className="flex items-center gap-1 mb-1 text-blue-700"><Download size={12}/> 1. Sauvegarder</strong>
                  À la fin de la session (écran Rapport), clique sur <strong>"Télécharger les Données (JSON)"</strong>. Conserve ce fichier sur ton ordinateur ou ta clé USB.
                </div>
                <div className="bg-white/60 p-2 rounded border border-blue-100">
                  <strong className="flex items-center gap-1 mb-1 text-blue-700"><Upload size={12}/> 2. Reprendre</strong>
                  Sur l'écran d'accueil, utilise le bouton <strong>"Reprendre une session"</strong> et sélectionne ton fichier JSON pour retrouver ton dialogue intact.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-2">À quoi sert cet outil ?</h3>
            <p className="text-sm leading-relaxed">
              Le DES n'est pas un chatbot classique qui donne des réponses. C'est un <strong>outil d'évaluation de processus</strong>. 
              Il ne juge pas seulement ta réponse finale, mais la solidité de ton cheminement intellectuel.
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
                <strong>Objectif :</strong> Justifier rationnellement ta position sans céder à la facilité.
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
                <strong>Objectif :</strong> Détecter les erreurs (biais, hallucinations, fautes logiques).
              </p>
            </div>
          </div>
          
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
