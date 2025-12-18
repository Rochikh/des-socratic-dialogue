import React, { useState, useEffect, useRef } from 'react';
import { Send, StopCircle, RefreshCw, FileSignature, AlertCircle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from "@google/genai";
import { Message, SessionConfig } from '../types';
import { sendMessage } from '../services/gemini';
import { GuideModal } from './GuideModal';

interface ChatViewProps {
  chatInstance: Chat | null;
  config: SessionConfig;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onFinish: (aiDeclaration: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatInstance, config, messages, setMessages, onFinish }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [declarationText, setDeclarationText] = useState('');
  
  // Chronométrie : on suit le timestamp de la dernière activité IA
  const [lastActivityAt, setLastActivityAt] = useState<number>(Date.now());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (messages.length === 0 && chatInstance) {
        setIsLoading(true);
        try {
          const res = await sendMessage(chatInstance, "Démarre la session selon le protocole pédagogique strict en me tutoyant.");
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: 'model',
            text: res.text,
            timestamp: Date.now()
          };
          setMessages([aiMsg]);
          setLastActivityAt(Date.now()); // Début du chrono pour l'étudiant
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
      } else if (messages.length > 0) {
        setLastActivityAt(Date.now());
      }
    };
    initChat();
  }, [chatInstance]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatInstance || isLoading) return;

    const now = Date.now();
    const reflectionTime = now - lastActivityAt; // Véritable temps de réflexion

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputText,
      timestamp: now,
      responseTimeMs: reflectionTime // On attache le temps de réflexion au message utilisateur
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await sendMessage(chatInstance, userMsg.text);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: res.text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setLastActivityAt(Date.now()); // Reset du chrono pour le prochain tour
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {showDeclarationModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><FileSignature className="text-indigo-600" /> Journal de bord IA</h2>
            <div className="bg-indigo-50 p-4 mb-6 text-sm text-indigo-900 rounded-lg">
              Décris ici ta méthodologie : as-tu utilisé des outils externes ? Quel a été ton prompt principal ? Cette déclaration sera comparée à ton comportement réel par Argos.
            </div>
            <textarea value={declarationText} onChange={(e) => setDeclarationText(e.target.value)} placeholder="Usage de l'IA..." className="w-full h-40 p-4 border rounded-xl mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeclarationModal(false)} className="px-5 py-2 text-slate-600">Annuler</button>
              <button onClick={() => onFinish(declarationText || "Non déclarée.")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Générer l'Audit Final</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{config.topic}</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{config.studentName} | {config.domain} | {config.mode}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowGuide(true)} className="p-2 text-slate-400 hover:text-indigo-600"><HelpCircle size={20} /></button>
          <button onClick={() => setShowDeclarationModal(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-md"><StopCircle size={16} /> TERMINER</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white text-slate-800 border rounded-bl-none'}`}>
              <div className="prose prose-sm max-w-none prose-slate"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
              <div className="text-[9px] mt-2 opacity-60 uppercase font-bold tracking-widest">{msg.role === 'model' ? 'ARGOS AGENT' : config.studentName}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl px-5 py-4 flex items-center gap-2">
              <RefreshCw className="animate-spin text-slate-400" size={16} /><span className="text-xs text-slate-500 font-bold uppercase">Analyse en cours...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 sm:p-6">
        <div className="max-w-4xl mx-auto relative">
          <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyPress} placeholder="Écris ici ton raisonnement..." className="w-full bg-slate-50 rounded-xl px-4 py-3 border focus:ring-2 focus:ring-indigo-500 min-h-[56px] resize-none" rows={1} />
          <button onClick={handleSend} disabled={!inputText.trim() || isLoading} className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-lg disabled:opacity-50"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};
