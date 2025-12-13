import React, { useState } from 'react';
import { AppMode, SessionConfig, Message } from './types';
import { SetupView } from './components/SetupView';
import { ChatView } from './components/ChatView';
import { ReportView } from './components/ReportView';
import { Chat } from "@google/genai";
import { createChatSession } from './services/gemini';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SETUP);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiDeclaration, setAiDeclaration] = useState<string>('');

  const handleStartSession = (newConfig: SessionConfig) => {
    setConfig(newConfig);
    
    // Initialize Gemini Chat Session
    const chat = createChatSession(newConfig.mode, newConfig.topic);
    setChatInstance(chat);
    
    setAppMode(AppMode.CHAT);
  };

  const handleFinishSession = (declaration: string) => {
    setAiDeclaration(declaration);
    setAppMode(AppMode.REPORT);
  };

  const handleRestart = () => {
    setConfig(null);
    setChatInstance(null);
    setMessages([]);
    setAiDeclaration('');
    setAppMode(AppMode.SETUP);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden relative">
        {appMode === AppMode.SETUP && (
          <SetupView onStart={handleStartSession} />
        )}
        
        {appMode === AppMode.CHAT && config && (
          <ChatView 
            chatInstance={chatInstance}
            config={config} 
            messages={messages}
            setMessages={setMessages}
            onFinish={handleFinishSession}
          />
        )}
        
        {appMode === AppMode.REPORT && config && (
          <ReportView 
            config={config} 
            transcript={messages} 
            aiDeclaration={aiDeclaration}
            onRestart={handleRestart}
          />
        )}
      </div>
      <footer className="shrink-0 py-1 text-center text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100">
        Rochane Kherbouche en CC BY SA
      </footer>
    </div>
  );
};

export default App;
