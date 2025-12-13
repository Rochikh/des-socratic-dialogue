import React, { useState, useEffect, useRef } from 'react';
import { Send, StopCircle, RefreshCw, FileSignature, AlertCircle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from "@google/genai";
import { Message, SessionConfig } from '../types';
import { sendMessage } from '../services/gemini';
import GuideModal from './GuideModal';

interface ChatViewProps {
  chatInstance: Chat | null;
  config: SessionConfig;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onFinish: (aiDeclaration: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatInstance, config, messages, setMessages, onFinish }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [declarationText, setDeclarationText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    const initChat = async () => {
      if (messages.length === 0 && chatInstance) {
        setIsLoading(true);
        try {
          const introResponse = await sendMessage(chatInstance, "Démarre la session selon le protocole pédagogique strict en me tutoyant.");
          setMessages([
            {
              id: crypto.randomUUID(),
              role: 'model',
              text: introResponse,
              timestamp: Date.now()
            }
          ]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInstance]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatInstance || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage(chatInstance, userMsg.text);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to get response", error);
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

  const handleFinishClick = () => {
    setShowDeclarationModal(true);
  };

  const handleSubmitDeclaration = () => {
    onFinish(declarationText || "Aucune déclaration fournie.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Guide Modal */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {/* Declaration Modal Overlay */}
      {showDeclarationModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <FileSignature size={32} />
              <h2 className="text-2xl font-bold text-slate-900">Déclaration de Responsabilité</h2>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 text-sm text-indigo-900">
              <p className="font-semibold flex items-center gap-2 mb-2">
                <AlertCircle size={16} />
                Trace de la collaboration Humain-IA (Promptographie)
              </p>
              <p>
                Pour valider cette session, décris brièvement comment tu as utilisé l'IA (ce tuteur ou d'autres outils externes) 
                et copie-colle les principaux "prompts" utilisés si pertinent. C'est ton "journal de bord" méthodologique.
              </p>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ta déclaration d'usage et méthodologie :
            </label>
            <textarea
              value={declarationText}
              onChange={(e) => setDeclarationText(e.target.value)}
              placeholder="Ex: J'ai utilisé le DES pour challenger mes idées sur X. J'ai aussi vérifié les faits sur [Source Y]. Voici mon prompt initial : '...'"
              className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6 resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeclarationModal(false)}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Retour au dialogue
              </button>
              <button
                onClick={handleSubmitDeclaration}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
              >
                Valider et Générer le Rapport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Session en cours : {config.topic}</h2>
          <p className="text-xs text-slate-500">Étudiant·e : {config.studentName} | Mode : {config.mode}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGuide(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Consulter le guide"
          >
            <HelpCircle size={20} />
          </button>
          <button
            onClick={handleFinishClick}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <StopCircle size={16} />
            Terminer & Évaluer
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                 <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.role === 'model' ? 'DES Agent' : config.studentName} • {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
              <RefreshCw className="animate-spin text-slate-400" size={16} />
              <span className="text-sm text-slate-500">Analyse du processus...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Écris ta réponse (sois explicite sur ton raisonnement)..."
            className="w-full bg-slate-100 text-slate-900 rounded-xl pl-4 pr-12 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-transparent transition-all"
            rows={1}
            style={{ minHeight: '50px', maxHeight: '150px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          Le système évalue ton processus de pensée, tes justifications et ton esprit critique.
        </p>
      </div>
    </div>
  );
};

export default ChatView;
