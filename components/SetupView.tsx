import React, { useState, useRef } from 'react';
import { SocraticMode, SessionConfig, Message, DomainType } from '../types';
import { BrainCircuit, BookOpen, User, HelpCircle, ShieldAlert, MessageCircleQuestion, Upload, AlertCircle, GraduationCap, Microscope, Languages } from 'lucide-react';
import { GuideModal } from './GuideModal';

interface SetupViewProps {
  onStart: (config: SessionConfig) => void;
  onResume: (config: SessionConfig, messages: Message[], aiDeclaration: string) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStart, onResume }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<SocraticMode>(SocraticMode.TUTOR);
  const [domain, setDomain] = useState<DomainType>(DomainType.DEBATE_THESIS);
  const [showGuide, setShowGuide] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && topic.trim()) {
      onStart({ studentName: name, topic, mode, domain });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportError(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (!json.metadata || !json.transcript) throw new Error("Format invalide");

          const resumedConfig: SessionConfig = {
            studentName: json.metadata.student || "Étudiant Inconnu",
            topic: json.metadata.topic || "Sujet Inconnu",
            mode: json.metadata.mode || SocraticMode.TUTOR,
            domain: json.metadata.domain || DomainType.DEBATE_THESIS
          };
          
          onResume(resumedConfig, json.transcript, json.aiDeclaration || "");
        } catch (err) {
          setImportError("Fichier invalide.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 relative">
      <button onClick={() => setShowGuide(true)} className="absolute top-4 right-4 z-50 flex items-center gap-2 text-slate-600 hover:text-indigo-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-md">
        <HelpCircle size={18} /> <span className="text-sm font-bold">Aide</span>
      </button>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 my-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center mb-6 text-indigo-600">
          <BrainCircuit size={48} />
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6 uppercase tracking-tighter">ARGOS DES</h1>

        <div className="mb-8 border-b border-slate-100 pb-6">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center justify-center gap-2 border-dashed">
            <Upload size={16} /> Reprendre une session existante
          </button>
          {importError && <div className="mt-2 text-xs text-rose-600 text-center">{importError}</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ton Nom</label>
              <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" placeholder="Nom..." value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sujet d'étude</label>
              <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" placeholder="Ex: Bioéthique..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Domaine Disciplinaire</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: DomainType.CLOSED_NOTION, label: 'Notion', icon: Languages, desc: 'Règles, def' },
                { id: DomainType.DEBATE_THESIS, label: 'Débat', icon: GraduationCap, desc: 'Idées, thèses' },
                { id: DomainType.SCIENTIFIC_TECHNICAL, label: 'Science', icon: Microscope, desc: 'Données, faits' }
              ].map((d) => (
                <button
                  key={d.id} type="button"
                  onClick={() => setDomain(d.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${domain === d.id ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-500 bg-white'}`}
                >
                  <d.icon size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Mode d'évaluation</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode(SocraticMode.TUTOR)} className={`p-3 rounded-xl border-2 text-center transition-all ${mode === SocraticMode.TUTOR ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-500 bg-white'}`}>
                <MessageCircleQuestion size={18} className="mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase">Tuteur</div>
              </button>
              <button type="button" onClick={() => setMode(SocraticMode.CRITIC)} className={`p-3 rounded-xl border-2 text-center transition-all ${mode === SocraticMode.CRITIC ? 'border-rose-600 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-500 bg-white'}`}>
                <ShieldAlert size={18} className="mx-auto mb-1" />
                <div className="text-[10px] font-bold uppercase">Critique</div>
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
            COMMENCER LA SESSION
          </button>
        </form>
      </div>
    </div>
  );
};
