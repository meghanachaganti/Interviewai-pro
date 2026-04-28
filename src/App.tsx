/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Building2, 
  Briefcase, 
  Layers, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  LogOut, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Trophy,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { COMPANIES, ROLES, ROUNDS } from './constants';
import { InterviewStatus, InterviewSession, Message, Feedback } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const startInterview = async (config: { companyId: string; roleId: string; roundId: string }) => {
    setLoading(true);
    const initialSession: InterviewSession = {
      ...config,
      messages: [],
    };
    
    try {
      const intro = "Welcome! Let's start your mock interview.";
      initialSession.messages.push({
        role: 'model',
        content: intro,
        timestamp: Date.now()
      });
      setSession(initialSession);
      setStatus('interviewing');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage]
    };
    
    setSession(updatedSession);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/interview", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: inputMessage,
    role: session.roleId,
    company: session.companyId,
    round: session.roundId,
  }),
});

const data = await res.json();
const response = data.reply;
      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, {
          role: 'model',
          content: response,
          timestamp: Date.now()
        }]
      } : null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = {
  overallScore: 80,
  technicalSkillsScore: 75,
  communicationScore: 85,
  summary: "Good performance!",
  strengths: ["Clear communication"],
  improvements: ["More depth needed"],
  sampleGoodAnswer: "Explain with examples."
};
      setFeedback(res);
      setStatus('feedback');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStatus('setup');
    setSession(null);
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none">InterviewAI</h1>
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-50">Professional Prep</span>
          </div>
        </div>
        
        {status !== 'setup' && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 text-sm font-medium hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Exit Session
          </button>
        )}
      </header>

      <main className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {status === 'setup' && (
            <SetupView onStart={startInterview} loading={loading} />
          )}

          {status === 'interviewing' && session && (
            <InterviewRoom 
              session={session} 
              onSend={sendMessage}
              onEnd={endInterview}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              loading={loading}
              chatEndRef={chatEndRef}
            />
          )}

          {status === 'feedback' && feedback && (
            <FeedbackDashboard feedback={feedback} onRestart={reset} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SetupView({ onStart, loading }: { onStart: (c: { companyId: string; roleId: string; roundId: string }) => void, loading: boolean }) {
  const [config, setConfig] = useState({
    companyId: COMPANIES[0].id,
    roleId: ROLES[0].id,
    roundId: ROUNDS[0].id
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-7 flex flex-col justify-center gap-8">
        <div className="space-y-4">
          <h2 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[0.9]">
            Master your <br />
            <span className="text-blue-600">dream interview.</span>
          </h2>
          <p className="text-xl text-[#86868B] max-w-lg">
            Personalized AI-powered mock interviews for Computer Science and AI enthusiasts. 
            Train with specific company models and rounds.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {COMPANIES.slice(0, 5).map(c => (
            <div key={c.id} className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-xs font-semibold grayscale opacity-50">
              {c.name}
            </div>
          ))}
          <div className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-xs font-semibold grayscale opacity-50 italic">
            + & many more
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200 space-y-6">
          <div className="space-y-6">
            {/* Company Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#86868B]">
                <Building2 size={14} /> Company
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPANIES.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setConfig(prev => ({ ...prev, companyId: c.id }))}
                    className={cn(
                      "text-left p-3 rounded-xl border text-sm transition-all duration-200",
                      config.companyId === c.id 
                        ? "border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-lg" 
                        : "border-zinc-200 hover:border-zinc-400"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#86868B]">
                <Briefcase size={14} /> Role
              </label>
              <select 
                value={config.roleId}
                onChange={(e) => setConfig(prev => ({ ...prev, roleId: e.target.value }))}
                className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Round Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#86868B]">
                <Layers size={14} /> Interview Round
              </label>
              <select 
                value={config.roundId}
                onChange={(e) => setConfig(prev => ({ ...prev, roundId: e.target.value }))}
                className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {ROUNDS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            disabled={loading}
            onClick={() => onStart(config)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-xl shadow-blue-600/20"
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <>Start Session <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InterviewRoom({ 
  session, 
  onSend, 
  onEnd, 
  inputMessage, 
  setInputMessage, 
  loading,
  chatEndRef
}: { 
  session: InterviewSession;
  onSend: () => void;
  onEnd: () => void;
  inputMessage: string;
  setInputMessage: (s: string) => void;
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const company = COMPANIES.find(c => c.id === session.companyId);
  const role = ROLES.find(r => r.id === session.roleId);
  const round = ROUNDS.find(r => r.id === session.roundId);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]"
    >
      {/* Simulation Info */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold", company?.logo)}>
              {company?.name[0]}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#86868B]">Interview At</p>
              <h3 className="font-bold text-lg">{company?.name}</h3>
            </div>
          </div>

          <div className="space-y-4 border-t border-zinc-100 pt-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#86868B]">Position</p>
              <p className="text-sm font-semibold">{role?.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#86868B]">Round Type</p>
              <p className="text-sm font-semibold">{round?.name}</p>
            </div>
          </div>

          <button 
            onClick={onEnd}
            disabled={loading || session.messages.length < 3}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-sm font-bold hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Submit Interview
          </button>
          
          <p className="text-[10px] text-center text-[#86868B]">
            * Participate for at least 3 messages <br />
            before seeking feedback.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-9 flex flex-col bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden h-full">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
          {session.messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full mb-4",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] rounded-3xl p-5 shadow-sm",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-zinc-100 text-[#1D1D1F] rounded-bl-none"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className={cn(
                  "text-[10px] mt-2 opacity-50",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 p-4 rounded-3xl rounded-bl-none animate-pulse flex gap-2">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-.5s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-zinc-100 bg-white">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type your response here... (Press Enter to send)"
              className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none h-[64px]"
            />
            <button 
              onClick={onSend}
              disabled={!inputMessage.trim() || loading}
              className="px-6 rounded-2xl bg-[#1D1D1F] text-white hover:bg-[#323232] disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeedbackDashboard({ feedback, onRestart }: { feedback: Feedback, onRestart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight">Interview Performance Report</h2>
        <p className="text-lg text-[#86868B]">Detailed analysis of your session from our AI evaluator.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard label="Overall Fit" score={feedback.overallScore} icon={<Trophy className="text-yellow-500" />} />
        <ScoreCard label="Technical Depth" score={feedback.technicalSkillsScore} icon={<BrainCircuit className="text-blue-500" />} />
        <ScoreCard label="Communication" score={feedback.communicationScore} icon={<MessageSquare className="text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-zinc-200 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={20} /> Executive Summary
          </h3>
          <p className="text-[#424245] leading-relaxed italic">"{feedback.summary}"</p>
          
          <div className="space-y-6 pt-4 border-t border-zinc-100">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Key Strengths</p>
              <div className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl text-emerald-700 text-sm font-medium border border-emerald-100">
                    <CheckCircle2 size={16} /> {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#86868B]">Needs Improvement</p>
              <div className="space-y-2">
                {feedback.improvements.map((im, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-700 text-sm font-medium border border-red-100">
                    <AlertCircle size={16} /> {im}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1D1D1F] text-white rounded-[32px] p-8 space-y-6 flex flex-col">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white/90">
            <BrainCircuit size={20} className="text-blue-400" /> AI Insights & Best Practices
          </h3>
          
          {feedback.sampleGoodAnswer ? (
            <div className="flex-1 space-y-4">
              <p className="text-sm font-semibold text-white/60 uppercase tracking-widest">Recommended Approach</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/90 text-sm leading-relaxed overflow-y-auto max-h-[400px]">
                <ReactMarkdown>{feedback.sampleGoodAnswer}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40 italic">
              Keep practicing to unlock more specific insights.
            </div>
          )}

          <button 
            onClick={onRestart}
            className="w-full py-4 bg-white text-[#1D1D1F] font-bold rounded-2xl hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2 mt-auto"
          >
            Start New Practice <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ label, score, icon }: { label: string, score: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-4 flex flex-col items-center">
      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#86868B] mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-zinc-300 font-bold">/100</span>
        </div>
      </div>
      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            "h-full rounded-full",
            score > 80 ? "bg-emerald-500" : score > 50 ? "bg-blue-500" : "bg-orange-500"
          )}
        />
      </div>
    </div>
  );
}
