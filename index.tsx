
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  MapPin, 
  Trash2, 
  X,
  MessageSquare,
  Users,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Shield,
  Star,
  Search,
  Clock,
  LayoutList,
  Table as TableIcon,
  Download,
  Sparkles,
  Cpu,
  Fingerprint,
  CheckCircle2,
  Mic,
  MicOff,
  Loader2,
  Edit3,
  Link as LinkIcon,
  UserPlus,
  AlertCircle,
  Save,
  Clock3
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface Match {
  id: string;
  date: string;
  time: string;
  stadium: string;
  opponent: string;
  teammates: string;
  finalScore: string;
  matchType: 'League' | 'Cup' | 'Friendly' | 'Tournament';
  rating: number;
  minutesPlayed: number;
  myGoals: number;
  assistFrom: string;
  myAssists: number;
  scorer: string;
  comments: string;
  timestamp: number;
}

type ViewMode = 'timeline' | 'sheet' | 'magic' | 'manual';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

// --- Components ---

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
            toast.type === 'success' ? 'bg-[#39FF14]/10 border-[#39FF14]/20 text-[#39FF14]' : 
            'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function TimelineCard({ match, onDelete, onEdit }: { match: Match; onDelete: (id: string) => void; onEdit: (match: Match) => void }) {
  return (
    <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-xl hover:border-white/20 transition-all animate-in fade-in slide-in-from-bottom-2 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[9px] font-black uppercase bg-white/10 text-white px-2 py-0.5 rounded italic border border-white/10">
                 {match.matchType}
               </span>
               <div className="flex items-center gap-0.5 ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < Math.round(match.rating / 2) ? 'fill-[#39FF14] text-[#39FF14]' : 'text-gray-700'} />
                  ))}
               </div>
            </div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-[#39FF14]">{match.finalScore || '0 - 0'}</h3>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">vs</span>
               <span className="text-sm font-black uppercase italic">{match.opponent}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <button onClick={() => onEdit(match)} className="p-2 text-gray-400 hover:text-[#39FF14] transition-colors bg-white/5 rounded-full">
              <Edit3 size={16} />
            </button>
            <button onClick={() => onDelete(match.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white/5 rounded-full">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-start gap-3 text-[10px] font-bold uppercase text-gray-400">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Clock size={12} className="text-[#39FF14]" />
              <span>{match.minutesPlayed}' Played</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Star size={12} className="text-[#39FF14]" />
              <span>Rating: {match.rating}/10</span>
            </div>
            {match.time && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Clock3 size={12} className="text-[#39FF14]" />
                <span>{match.time}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <div className="flex items-center gap-2 mb-2">
                  <Target size={12} className="text-[#39FF14]" />
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest leading-none">Goals</span>
               </div>
               <div className="text-2xl font-black italic leading-none mb-1">{match.myGoals}</div>
               {match.assistFrom && (
                 <div className="text-[8px] uppercase text-gray-500 font-bold truncate">
                    Assisted by: <span className="text-white">{match.assistFrom}</span>
                 </div>
               )}
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-[#39FF14]" />
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest leading-none">Assists</span>
               </div>
               <div className="text-2xl font-black italic leading-none mb-1">{match.myAssists}</div>
               {match.scorer && (
                 <div className="text-[8px] uppercase text-gray-500 font-bold truncate">
                    Scored by: <span className="text-white">{match.scorer}</span>
                 </div>
               )}
            </div>
          </div>

          {match.teammates && (
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
               <Users size={12} className="text-gray-500" />
               <div className="text-[8px] font-bold uppercase text-gray-400 truncate tracking-wider">
                  Squad: <span className="text-gray-300">{match.teammates}</span>
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[9px] font-black uppercase text-gray-700 tracking-[0.15em] pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5"><Calendar size={10} /> {match.date}</div>
          <div className="flex items-center gap-1.5 text-right max-w-[150px] truncate"><MapPin size={10} /> {match.stadium}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, active }: { label: string; value: any; active?: boolean }) {
  return (
    <div className={`p-4 rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center text-center ${active ? 'bg-[#39FF14]/5 border-[#39FF14]/30' : 'bg-white/5 border-white/10'}`}>
      <div className={`text-xl font-black italic tracking-tighter leading-none mb-1 ${active ? 'text-[#39FF14]' : 'text-white'}`}>{value}</div>
      <div className="text-[7px] uppercase text-gray-600 font-black tracking-[0.1em]">{label}</div>
    </div>
  );
}

// --- Main App ---

export function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('magic');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Magic Entry State
  const [magicInput, setMagicInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftMatch, setDraftMatch] = useState<Partial<Match> | null>(null);
  
  // Manual Entry Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualMatch, setManualMatch] = useState<Partial<Match>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    opponent: '',
    finalScore: '',
    stadium: '',
    matchType: 'League',
    rating: 7,
    myGoals: 0,
    assistFrom: '',
    myAssists: 0,
    scorer: '',
    teammates: '',
    minutesPlayed: 90,
    comments: ''
  });

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pitchperfect_2026_data');
    if (saved) {
      try {
        setMatches(JSON.parse(saved));
      } catch (e) {
        console.error("Local-first corruption, resetting...", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pitchperfect_2026_data', JSON.stringify(matches));
  }, [matches]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addMatch = (matchData: Partial<Match>) => {
    if (editingId) {
      setMatches(prev => prev.map(m => m.id === editingId ? { ...m, ...matchData } as Match : m));
      addToast("Performance Archive Updated", "success");
    } else {
      const finalMatch: Match = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        date: matchData.date || new Date().toISOString().split('T')[0],
        time: matchData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        opponent: matchData.opponent || 'Unknown',
        stadium: matchData.stadium || 'Unknown',
        finalScore: matchData.finalScore || '0 - 0',
        matchType: (matchData.matchType as Match['matchType']) || 'League',
        rating: matchData.rating || 5,
        minutesPlayed: matchData.minutesPlayed || 90,
        myGoals: matchData.myGoals || 0,
        myAssists: matchData.myAssists || 0,
        comments: matchData.comments || '',
        teammates: matchData.teammates || '',
        assistFrom: matchData.assistFrom || '',
        scorer: matchData.scorer || ''
      };
      setMatches([finalMatch, ...matches]);
      addToast("New Performance Archived", "success");
    }

    setViewMode('timeline');
    setMagicInput('');
    setDraftMatch(null);
    resetManualForm();
  };

  const resetManualForm = () => {
    setEditingId(null);
    setManualMatch({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      opponent: '',
      finalScore: '',
      stadium: '',
      matchType: 'League',
      rating: 7,
      myGoals: 0,
      assistFrom: '',
      myAssists: 0,
      scorer: '',
      teammates: '',
      minutesPlayed: 90,
      comments: ''
    });
  };

  const deleteMatch = (id: string) => {
    if (window.confirm("Are you sure you want to delete this performance?")) {
      setMatches(matches.filter(m => m.id !== id));
      addToast("Performance Deleted", "info");
    }
  };

  const startEdit = (match: Match) => {
    setEditingId(match.id);
    setManualMatch(match);
    setViewMode('manual');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      drawWaveform();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      addToast("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyzerRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(57, 255, 20, ${dataArray[i] / 255})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const commonResponseSchema = {
    type: Type.OBJECT,
    properties: {
      opponent: { type: Type.STRING },
      finalScore: { type: Type.STRING },
      stadium: { type: Type.STRING },
      date: { type: Type.STRING, description: "YYYY-MM-DD format" },
      time: { type: Type.STRING, description: "HH:MM format" },
      myGoals: { type: Type.NUMBER },
      myAssists: { type: Type.NUMBER },
      matchType: { type: Type.STRING, description: "One of: League, Cup, Friendly, Tournament" },
      rating: { type: Type.NUMBER, description: "1-10 performance rating" },
      teammates: { type: Type.STRING },
      assistFrom: { type: Type.STRING },
      scorer: { type: Type.STRING },
      comments: { type: Type.STRING }
    }
  };

  const processAudioInput = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const base64Audio = await blobToBase64(blob);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: base64Audio
                }
              },
              {
                text: "Extract football match performance data. If date or time is not mentioned, use current. Output structure should strictly follow the schema."
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: commonResponseSchema,
        },
      });

      const extracted = JSON.parse(response.text || "{}");
      handleExtractedData(extracted);
    } catch (err) {
      console.error("Audio processing failed", err);
      addToast("Neural Core failed to decode audio", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const processMagicInput = async () => {
    if (!magicInput.trim()) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this match report and extract structured data: "${magicInput}". Current date is ${new Date().toISOString().split('T')[0]}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: commonResponseSchema,
        },
      });
      const extracted = JSON.parse(response.text || "{}");
      handleExtractedData(extracted);
    } catch (error) {
      console.error("Neural core error:", error);
      addToast("Neural Core failed to analyze text", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractedData = (extracted: any) => {
    setDraftMatch({
      ...extracted,
      id: Date.now().toString(),
      date: extracted.date || new Date().toISOString().split('T')[0],
      time: extracted.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: Date.now(),
      minutesPlayed: 90
    });
    addToast("Neural data extracted. Please confirm.", "info");
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Time', 'Opponent', 'Score', 'Type', 'Goals', 'AssistedBy', 'Assists', 'ScoredBy', 'Teammates', 'Rating', 'Venue'];
    const rows = matches.map(m => [
      m.date, 
      m.time || '-',
      m.opponent, 
      m.finalScore, 
      m.matchType, 
      m.myGoals, 
      m.assistFrom,
      m.myAssists, 
      m.scorer,
      m.teammates,
      m.rating, 
      m.stadium
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pitchperfect_export_${Date.now()}.csv`;
    link.click();
    addToast("Data exported successfully", "success");
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => 
      m.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.stadium.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teammates.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [matches, searchQuery]);

  const stats = {
    total: matches.length,
    goals: matches.reduce((sum, m) => sum + (Number(m.myGoals) || 0), 0),
    assists: matches.reduce((sum, m) => sum + (Number(m.myAssists) || 0), 0),
    avgRating: matches.length > 0 
      ? (matches.reduce((sum, m) => sum + m.rating, 0) / matches.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-[#050505] text-white p-6 pb-28 font-sans selection:bg-[#39FF14] selection:text-black">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#39FF14] p-2 rounded-xl text-black">
             <Cpu size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">PitchPerfect</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] text-[#39FF14] font-black uppercase tracking-[0.2em] border border-[#39FF14]/30 px-1.5 py-0.5 rounded">Neural Core v2.7</span>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-1">
                <Fingerprint size={8} /> 2026 Edition
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-stretch md:self-auto shadow-2xl overflow-hidden">
          <button 
            onClick={() => setViewMode('magic')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'magic' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <Sparkles size={12} /> AI Capture
          </button>
          <button 
            onClick={() => { resetManualForm(); setViewMode('manual'); }}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'manual' && !editingId ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <Plus size={12} /> New Match
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <LayoutList size={12} /> History
          </button>
          <button 
            onClick={() => setViewMode('sheet')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'sheet' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'text-gray-500 hover:text-white'}`}
          >
            <TableIcon size={12} /> Sheet
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Total Matches" value={stats.total} />
        <StatCard label="Total Goals" value={stats.goals} active />
        <StatCard label="Total Assists" value={stats.assists} />
        <StatCard label="Season Rating" value={stats.avgRating} />
      </div>

      {/* Main Viewport */}
      <main className="space-y-8">
        
        {viewMode === 'magic' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('timeline')}
                className="p-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center flex-1 pr-8">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">
                  Neural <br/> <span className="text-[#39FF14]">Analysis</span>
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Voice or Text. Seamless Capture.</p>
              </div>
            </div>

            <div className="relative group">
              <textarea 
                value={magicInput}
                onChange={(e) => setMagicInput(e.target.value)}
                placeholder="E.g. 'Scored a hat-trick today at 5pm. Won 4-2 against Tigers at home.'"
                className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] p-10 text-xl md:text-2xl font-black italic focus:border-[#39FF14] outline-none transition-all placeholder:text-gray-800 resize-none h-48 shadow-2xl group-hover:bg-white/[0.08]"
              />
              
              {isRecording && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center p-8 space-y-6">
                  <canvas ref={canvasRef} className="w-full h-24" width={600} height={100} />
                  <div className="text-[#39FF14] font-black uppercase italic animate-pulse tracking-widest">Neural Listening...</div>
                </div>
              )}

              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-full shadow-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-[#39FF14] hover:bg-white/20'}`}
                >
                  {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button 
                  onClick={processMagicInput}
                  disabled={isProcessing || !magicInput.trim() || isRecording}
                  className="bg-[#39FF14] text-black p-4 rounded-full shadow-[0_10px_30_rgba(57,255,20,0.4)] hover:scale-110 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <ChevronRight size={24} />}
                </button>
              </div>
            </div>

            {/* Manifesting Preview */}
            {draftMatch && (
              <div className="bg-white/5 rounded-[3rem] border-2 border-[#39FF14]/30 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#39FF14]" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14]">Neural Confirmation</span>
                  </div>
                  <button onClick={() => setDraftMatch(null)} className="text-gray-600 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Performance Profile</div>
                      <div className="text-5xl font-black italic text-white uppercase tracking-tighter">{draftMatch.opponent}</div>
                      <div className="text-2xl font-black italic text-[#39FF14]">{draftMatch.finalScore}</div>
                      <div className="flex flex-wrap items-center gap-4 text-gray-400 font-bold uppercase text-[10px]">
                         <div className="flex items-center gap-2"><MapPin size={12} /> {draftMatch.stadium}</div>
                         <div className="flex items-center gap-2"><Calendar size={12} /> {draftMatch.date}</div>
                         <div className="flex items-center gap-2"><Clock3 size={12} /> {draftMatch.time}</div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                         <div className="text-3xl font-black italic">{draftMatch.myGoals}</div>
                         <div className="text-[8px] uppercase font-black text-gray-500 mt-1">Goals</div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                         <div className="text-3xl font-black italic">{draftMatch.myAssists}</div>
                         <div className="text-[8px] uppercase font-black text-gray-500 mt-1">Assists</div>
                      </div>
                      <div className="col-span-2 bg-white/5 p-4 rounded-3xl border border-white/10 flex justify-between items-center px-6">
                         <span className="text-[8px] uppercase font-black text-gray-500">Neural Rating</span>
                         <span className="text-xl font-black text-[#39FF14]">{draftMatch.rating}/10</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => addMatch(draftMatch)}
                  className="w-full bg-[#39FF14] text-black py-6 rounded-full font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  Confirm and Store Data
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'manual' && (
          <div className="max-w-4xl mx-auto bg-white/5 rounded-[3rem] border border-white/10 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4 mb-10">
               <button 
                 onClick={() => { resetManualForm(); setViewMode('timeline'); }}
                 className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-[#39FF14] hover:border-[#39FF14]/30 transition-all"
               >
                 <ChevronLeft size={24} />
               </button>
               <div className="flex-1">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    {editingId ? 'Edit Archive' : 'Manual Capture'}
                  </h2>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                    {editingId ? `Refining performance ID: ${editingId}` : 'Structured Performance Entry'}
                  </p>
               </div>
               {editingId ? <Save size={32} className="text-[#39FF14]" /> : <Edit3 size={32} className="text-[#39FF14]" />}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Core Match Data */}
                <div className="space-y-6">
                  <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest border-b border-white/5 pb-2">Match Basics</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Opponent</label>
                      <input 
                        type="text" 
                        placeholder="TEAM NAME"
                        value={manualMatch.opponent}
                        onChange={(e) => setManualMatch({...manualMatch, opponent: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Date</label>
                        <input 
                          type="date" 
                          value={manualMatch.date}
                          onChange={(e) => setManualMatch({...manualMatch, date: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all text-white" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Time</label>
                        <input 
                          type="time" 
                          value={manualMatch.time}
                          onChange={(e) => setManualMatch({...manualMatch, time: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all text-white" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Stadium</label>
                      <input 
                        type="text" 
                        placeholder="VENUE NAME"
                        value={manualMatch.stadium}
                        onChange={(e) => setManualMatch({...manualMatch, stadium: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Final Score</label>
                      <input 
                        type="text" 
                        placeholder="E.G. 3 - 0"
                        value={manualMatch.finalScore}
                        onChange={(e) => setManualMatch({...manualMatch, finalScore: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                  </div>
                </div>

                {/* Performance & Link-up */}
                <div className="space-y-6">
                  <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest border-b border-white/5 pb-2">Intelligence & Link-up</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4 flex items-center gap-1"><Target size={10}/> My Goals</label>
                      <input 
                        type="number" 
                        value={manualMatch.myGoals}
                        onChange={(e) => setManualMatch({...manualMatch, myGoals: parseInt(e.target.value) || 0})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4 flex items-center gap-1"><Zap size={10}/> My Assists</label>
                      <input 
                        type="number" 
                        value={manualMatch.myAssists}
                        onChange={(e) => setManualMatch({...manualMatch, myAssists: parseInt(e.target.value) || 0})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4 flex items-center gap-1"><LinkIcon size={10}/> Assisted By</label>
                      <input 
                        type="text" 
                        placeholder="NAME"
                        value={manualMatch.assistFrom}
                        onChange={(e) => setManualMatch({...manualMatch, assistFrom: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4 flex items-center gap-1"><Target size={10}/> Goal Scored By</label>
                      <input 
                        type="text" 
                        placeholder="NAME"
                        value={manualMatch.scorer}
                        onChange={(e) => setManualMatch({...manualMatch, scorer: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-4 flex items-center gap-1"><Users size={10}/> Squad (Teammates)</label>
                      <input 
                        type="text" 
                        placeholder="NAMES (SEPARATED BY COMMAS)"
                        value={manualMatch.teammates}
                        onChange={(e) => setManualMatch({...manualMatch, teammates: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all uppercase" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Performance Rating (1-10)</label>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                       <input 
                        type="range" 
                        min="1" max="10" 
                        value={manualMatch.rating}
                        onChange={(e) => setManualMatch({...manualMatch, rating: parseInt(e.target.value)})}
                        className="flex-1 accent-[#39FF14]" 
                      />
                      <span className="text-[#39FF14] font-black italic text-lg w-8 text-center">{manualMatch.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-4">Tactical Notes / Comments</label>
                  <textarea 
                    value={manualMatch.comments}
                    onChange={(e) => setManualMatch({...manualMatch, comments: e.target.value})}
                    placeholder="NOTES ON CONDITIONS, TACTICS, OR KEY PLAYS..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all h-24 resize-none uppercase"
                  />
                </div>
             </div>

             <button 
               onClick={() => addMatch(manualMatch)}
               className="w-full bg-[#39FF14] text-black py-6 rounded-[2rem] font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-10 flex items-center justify-center gap-3"
             >
               {editingId ? <><Save size={20} /> Update Performance Archive</> : <><Plus size={20} /> Store Performance Archive</>}
             </button>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#39FF14] transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Search archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:border-[#39FF14] outline-none transition-all"
                />
              </div>
            </div>
            {filteredMatches.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                <p className="text-gray-700 font-black uppercase text-xs tracking-widest">No matching performance archives found.</p>
                <button onClick={() => setViewMode('manual')} className="mt-4 text-[#39FF14] font-black uppercase text-[10px] tracking-widest border border-[#39FF14]/30 px-6 py-2 rounded-full hover:bg-[#39FF14]/10 transition-all">Add New Archive</button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6">
                {filteredMatches.map(m => (
                  <TimelineCard key={m.id} match={m} onDelete={deleteMatch} onEdit={startEdit} />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'sheet' && (
          <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Performance Ledger</span>
               <button onClick={downloadCSV} className="text-[#39FF14] flex items-center gap-2 text-[10px] font-black uppercase">
                 <Download size={14} /> Export CSV
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-white/[0.03] text-[9px] font-black uppercase text-gray-600 tracking-widest">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Opponent</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-center">G</th>
                    <th className="px-6 py-4 text-center">A</th>
                    <th className="px-6 py-4">Assisted By</th>
                    <th className="px-6 py-4">Squad</th>
                    <th className="px-6 py-4 text-center">Rating</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMatches.map(m => (
                    <tr key={m.id} className="text-[10px] font-bold hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-mono">{m.date}</td>
                      <td className="px-6 py-4 text-gray-600">{m.time || '-'}</td>
                      <td className="px-6 py-4 uppercase italic text-white">{m.opponent}</td>
                      <td className="px-6 py-4 text-[#39FF14] italic">{m.finalScore}</td>
                      <td className="px-6 py-4 text-center">{m.myGoals}</td>
                      <td className="px-6 py-4 text-center">{m.myAssists}</td>
                      <td className="px-6 py-4 text-gray-500 uppercase">{m.assistFrom || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 uppercase truncate max-w-[150px]">{m.teammates || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded ${m.rating >= 8 ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-white/10 text-white'}`}>
                          {m.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 uppercase">{m.stadium}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <button onClick={() => startEdit(m)} className="text-gray-600 hover:text-[#39FF14]"><Edit3 size={14}/></button>
                           <button onClick={() => deleteMatch(m.id)} className="text-gray-700 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action (AI/Voice) */}
      {viewMode !== 'magic' && (
        <button 
          onClick={() => setViewMode('magic')}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-12 py-5 rounded-full font-black uppercase italic shadow-[0_20px_50px_rgba(57,255,20,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-50 group"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" /> 
          <span>Neural Capture</span>
        </button>
      )}

      {/* Vault Status Indicator */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-[8px] font-black uppercase text-gray-700 tracking-widest bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/5">
         <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full" />
         Vault Integrity: Secured
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
