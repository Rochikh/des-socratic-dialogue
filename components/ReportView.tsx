import React, { useEffect, useState } from 'react';
import { AnalysisData, SessionConfig } from '../types';
import { generateAnalysis } from '../services/gemini';
import { Message } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, CheckCircle, AlertTriangle, FileText, FileJson, Copy, Check, FileSignature, Info, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportViewProps {
  config: SessionConfig;
  transcript: Message[];
  aiDeclaration: string;
  onRestart: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ config, transcript, aiDeclaration, onRestart }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      // Pass the declaration to the analysis service
      const result = await generateAnalysis(transcript, config.topic, aiDeclaration);
      setAnalysis(result);
      setLoading(false);
    };
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenPrintView = () => {
    if (!analysis) return;

    // Création d'une fenêtre popup pour l'impression
    // Cette méthode contourne les problèmes de CSS (overflow/h-screen) de l'application React principale
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour générer le rapport imprimable.");
      return;
    }

    // Fonction utilitaire pour formater simplement le markdown pour l'impression HTML brute
    const formatText = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br>'); // New Lines
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Rapport DES - ${config.studentName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { font-size: 24px; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { font-size: 18px; color: #334155; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          h3 { font-size: 16px; color: #475569; margin-top: 20px; font-weight: bold; }
          
          .header-meta { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-item label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          .meta-item div { font-weight: bold; font-size: 16px; }
          
          .summary { background: #fff; text-align: justify; }
          
          .scores-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
          .score-card { background: #f1f5f9; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .score-name { font-weight: 500; }
          .score-val { font-weight: bold; font-size: 18px; color: #4f46e5; }
          
          .lists-container { display: flex; gap: 20px; margin-top: 20px; }
          .list-col { flex: 1; }
          ul { padding-left: 20px; margin-top: 10px; }
          li { margin-bottom: 5px; font-size: 14px; }
          
          .declaration { background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 15px; font-style: italic; margin-top: 10px; font-size: 14px; }
          
          .transcript { margin-top: 20px; border-top: 1px solid #e2e8f0; }
          .msg { padding: 15px 0; border-bottom: 1px solid #f1f5f9; page-break-inside: avoid; }
          .msg-role { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #64748b; }
          .msg-user .msg-role { color: #4f46e5; }
          .msg-content { font-size: 14px; white-space: pre-wrap; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 15px; background: #fff1f2; border: 1px solid #fda4af; border-radius: 6px; color: #be123c; text-align: center; font-size: 14px;">
          Si l'impression ne se lance pas automatiquement, fais CTRL+P ou CMD+P.
        </div>

        <h1>Rapport de Dialogue Évaluatif Socratique</h1>
        
        <div class="header-meta">
          <div class="meta-item">
            <label>Étudiant·e</label>
            <div>${config.studentName}</div>
          </div>
          <div class="meta-item">
            <label>Sujet</label>
            <div>${config.topic}</div>
          </div>
          <div class="meta-item">
            <label>Date</label>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <h2>Synthèse Pédagogique</h2>
        <div class="summary">${analysis.summary}</div>

        <h2>Scores de Compétences</h2>
        <div class="scores-grid">
          <div class="score-card"><span class="score-name">Raisonnement</span> <span class="score-val">${analysis.reasoningScore}/100</span></div>
          <div class="score-card"><span class="score-name">Esprit Critique</span> <span class="score-val">${analysis.skepticismScore}/100</span></div>
          <div class="score-card"><span class="score-name">Processus & Itération</span> <span class="score-val">${analysis.processScore}/100</span></div>
          <div class="score-card"><span class="score-name">Métacognition</span> <span class="score-val">${analysis.reflectionScore}/100</span></div>
        </div>

        <div class="lists-container">
          <div class="list-col">
            <h3>Points Forts</h3>
            <ul>${analysis.keyStrengths.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="list-col">
            <h3>Points de Vigilance</h3>
            <ul>${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
          </div>
        </div>

        <h2>Déclaration de Méthodologie (Agraphie)</h2>
        <div class="declaration">
          "${analysis.aiDeclaration}"
        </div>

        <h2>Trace d'Apprentissage (Transcription)</h2>
        <div class="transcript">
          ${transcript.map(msg => `
            <div class="msg ${msg.role === 'user' ? 'msg-user' : 'msg-model'}">
              <div class="msg-role">${msg.role === 'user' ? config.studentName : 'Agent DES'}</div>
              <div class="msg-content">${formatText(msg.text)}</div>
            </div>
          `).join('')}
        </div>

        <script>
          // Lancer l'impression automatiquement au chargement
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleDownloadJSON = () => {
    if (!analysis) return;
    const data = {
      metadata: {
        date: new Date().toISOString(),
        student: config.studentName,
        topic: config.topic,
        mode: config.mode,
      },
      analysis,
      transcript,
      aiDeclaration
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DES-Rapport-${config.studentName.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    if (!analysis) return;
    
    const textReport = `
RAPPORT D'ÉVALUATION DES (FOCUS PROCESSUS)
------------------------------------------
Étudiant·e : ${config.studentName}
Sujet : ${config.topic}
Date : ${new Date().toLocaleDateString()}
Mode : ${config.mode}

SYNTHÈSE PÉDAGOGIQUE
--------------------
${analysis.summary}

DÉCLARATION D'USAGE DE L'IA (AGRAPHIE)
--------------------------------------
${analysis.aiDeclaration}

SCORES (0-100)
--------------
Raisonnement : ${analysis.reasoningScore}
Clarté : ${analysis.clarityScore}
Esprit Critique : ${analysis.skepticismScore}
Processus / Itération : ${analysis.processScore}
Métacognition : ${analysis.reflectionScore}

TRANSCRIPTION
-------------
${transcript.map(m => `[${m.role === 'user' ? 'ÉTUDIANT·E' : 'IA'}]: ${m.text}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(textReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Génération du rapport de compétences...</h2>
        <p className="text-slate-500 mt-2">Évaluation de la trace d'apprentissage et de la vigilance critique.</p>
      </div>
    );
  }

  if (!analysis) return <div>Erreur de chargement.</div>;

  const chartData = [
    { name: 'Raisonnement', score: analysis.reasoningScore, color: '#4f46e5' }, // Indigo
    { name: 'Critique', score: analysis.skepticismScore, color: '#e11d48' }, // Rose
    { name: 'Processus', score: analysis.processScore, color: '#059669' }, // Emerald (New)
    { name: 'Métacognition', score: analysis.reflectionScore, color: '#d97706' }, // Amber (New)
  ];

  return (
    <div className="h-full bg-slate-100 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Report Header */}
        <div className="bg-slate-900 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Rapport d'Évaluation DES</h1>
              <p className="opacity-80">Processus & Pensée Critique</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-lg font-semibold">{config.studentName}</p>
              <p className="text-sm opacity-70">Sujet : {config.topic}</p>
              <p className="text-xs opacity-50 mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Analysis Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" /> Synthèse du Processus
              </h3>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-justify">
                {analysis.summary}
              </div>
            </section>

            {/* AI Declaration Section */}
            <section>
               <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileSignature className="text-indigo-600" /> Déclaration de Responsabilité (Agraphie)
              </h3>
               <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-slate-800 text-sm italic">
                "{analysis.aiDeclaration}"
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} /> Points Forts
                </h4>
                <ul className="list-disc list-inside space-y-2 text-green-900 text-sm">
                  {analysis.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </section>

              <section className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} /> Points de Vigilance
                </h4>
                <ul className="list-disc list-inside space-y-2 text-amber-900 text-sm">
                  {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </section>
            </div>

            <section className="mt-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Trace de l'Apprentissage (Transcription)</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4 max-h-96 overflow-y-auto">
                {transcript.map((msg) => (
                  <div key={msg.id} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                    <span className={`text-xs font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {msg.role === 'user' ? config.studentName : 'Agent DES'}
                    </span>
                    <div className="mt-1 text-sm text-slate-700 prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Metrics */}
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 text-center">Indicateurs de Performance</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={30}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-xs text-slate-500">
                L'évaluation porte sur la méthode et la réflexivité.
              </div>
            </section>

            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">Exportations</p>
              
              <div>
                <button
                  onClick={handleOpenPrintView}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <Printer size={18} />
                  Générer Rapport Imprimable
                </button>
                <p className="text-[10px] text-slate-500 mt-2 text-center leading-tight">
                   Ouvre une version simplifiée optimisée pour l'impression ou la sauvegarde en PDF.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <button
                  onClick={handleDownloadJSON}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-800 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors text-sm mb-2"
                >
                  <FileJson size={16} />
                  Télécharger les Données (JSON)
                </button>
                <div className="flex gap-2 text-blue-800 text-[11px] leading-tight items-start">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>À quoi ça sert ?</strong> Ce fichier contient l'intégralité de tes données brutes (dialogue et scores). Il sert de preuve numérique inaltérable de ton travail et peut être transmis à ton enseignant·e.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyText}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copied ? "Copié dans le presse-papier" : "Copier le texte résumé"}
              </button>
            </div>
            
            <hr className="border-slate-200" />

            <button
              onClick={onRestart}
              className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              Nouvelle Session
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportView;
