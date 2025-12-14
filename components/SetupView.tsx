import React, { useState } from 'react';
import { SocraticMode, SessionConfig } from '../types';
import { BrainCircuit, BookOpen, User, HelpCircle, ShieldAlert, MessageCircleQuestion } from 'lucide-react';
import { GuideModal } from './GuideModal';

interface SetupViewProps {
  onStart: (config: SessionConfig) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<SocraticMode>(SocraticMode.TUTOR);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && topic.trim()) {
      onStart({ studentName: name, topic, mode });
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 relative">
      
      {/* Bouton d'aide flottant - Rendu plus visible (Opaque + Z-Index) */}
      <button 
        onClick={() => setShowGuide(true)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all bg-white px-4 py-2 rounded-full border border-slate-200 shadow-md hover:shadow-lg"
      >
        <HelpCircle size={18} />
        <span className="text-sm font-bold">Mode d'emploi</span>
      </button>

      {/* Guide Modal */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 my-auto z-10 relative">
        <div className="flex items-center justify-center mb-6 text-indigo-600">
          <BrainCircuit size={48} />
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">DES</h1>
        <p className="text-center text-slate-500">Dialogue Évaluatif Socratique</p>
        
        {/* Lien de secours si le bouton flottant est raté */}
        <div className="text-center mb-8 mt-2">
          <button 
            onClick={() => setShowGuide(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Lire le guide d'utilisation
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ton Nom</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ex: Camille Étudiant·e"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sujet d'étude</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ex: Éthique de l'IA, La Révolution Française..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Mode d'évaluation</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode(SocraticMode.TUTOR)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === SocraticMode.TUTOR
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-2">
                   <MessageCircleQuestion size={16} /> Tuteur·rice Socratique
                </div>
                <div className="text-xs opacity-80">L'IA pose des questions, tu défends ton raisonnement.</div>
              </button>

              <button
                type="button"
                onClick={() => setMode(SocraticMode.CRITIC)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === SocraticMode.CRITIC
                    ? 'border-rose-600 bg-rose-50 text-rose-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <ShieldAlert size={16} /> Critique de l'IA
                </div>
                <div className="text-xs opacity-80">L'IA commet des erreurs volontaires, tu les identifies.</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform active:scale-95"
          >
            Commencer l'évaluation
          </button>
        </form>
      </div>
    </div>
  );
};
