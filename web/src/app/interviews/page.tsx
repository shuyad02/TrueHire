"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Video, Square, Play, ShieldAlert, Sparkles, User, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/store/authStore";

export default function MockInterviewsPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiData, setAiData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const recognitionRef = useRef<any>(null);

  // Stop recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErrorMsg("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
        return null;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };
      
      return recognition;
    }
    return null;
  };

  const startInterview = () => {
    setErrorMsg("");
    setTranscript("");
    
    const recognition = initSpeechRecognition();
    if (!recognition) return;
    
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setShowFeedback(false);
      setAiData(null);
    } catch (e: any) {
      setErrorMsg("Failed to start microphone. Please check permissions.");
    }
  };

  const endInterview = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (!transcript.trim()) {
      setErrorMsg("No speech detected. Please try again and speak into the microphone.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiFetch("/api/student/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze interview");
      
      setAiData(data);
      setShowFeedback(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BrainCircuit size={40} className="text-indigo-400" />
            AI Mock <span className="gradient-text">Interviews</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Practice technical and HR rounds with our advanced Gemini AI. Get real-time feedback and improve your Hire-Ready Score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Interview Area */}
          <div className="lg:col-span-2 glass-card p-0 overflow-hidden flex flex-col h-[500px]">
            <div className="flex-1 bg-slate-900 relative flex flex-col items-center justify-center p-6">
              {isRecording ? (
                <>
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC
                  </div>
                  {/* Fake webcam view */}
                  <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-8 border-4 border-indigo-500/30">
                     <User size={64} className="text-slate-600" />
                  </div>
                  
                  {/* Real-time transcript display */}
                  <div className="w-full max-w-lg bg-slate-950/50 rounded-lg p-4 mb-16 h-24 overflow-y-auto border border-slate-800">
                    <p className="text-slate-300 text-sm italic">
                      {transcript || "Listening..."}
                    </p>
                  </div>

                  {/* Waveform animation */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                        className="w-1.5 bg-indigo-500 rounded-full"
                      />
                    ))}
                  </div>
                </>
              ) : isProcessing ? (
                <div className="text-center flex flex-col items-center">
                  <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing your interview...</h3>
                  <p className="text-slate-400 text-sm">Gemini AI is generating your feedback report.</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Video size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Camera & Microphone Access Required</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                    The AI needs microphone access to listen to your responses. Answer the question: "Tell me about yourself and your skills."
                  </p>
                  {errorMsg && (
                    <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      {errorMsg}
                    </div>
                  )}
                  <button onClick={startInterview} className="btn btn-primary px-8 py-3">
                    <Play size={18} /> Start Mock Interview
                  </button>
                </div>
              )}
            </div>
            
            {/* Controls */}
            {isRecording && (
              <div className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4 shrink-0">
                <button className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Mic size={20} className="text-emerald-400" />
                </button>
                <button onClick={endInterview} className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  <Square size={20} className="fill-current" />
                </button>
                <button className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Video size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Feedback & Stats Area */}
          <div className="lg:col-span-1 space-y-6">
            {!showFeedback || !aiData ? (
              <div className="glass-card h-full flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
                <ShieldAlert size={40} className="text-slate-600 mb-4" />
                <h3 className="font-bold text-slate-300 mb-2">Awaiting Session</h3>
                <p className="text-slate-500 text-sm">
                  Complete an interview session to generate your AI feedback report based on your speech.
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col h-full relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
                
                <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold">
                  <Sparkles size={18} /> AI Feedback Report
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Overall Score</div>
                    <div className={`text-3xl font-black ${aiData.overallScore >= 80 ? 'text-emerald-400' : aiData.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {aiData.overallScore}/100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-sm mb-1">Confidence</div>
                    <div className="text-xl font-bold text-indigo-400">{aiData.confidenceLevel}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2">
                  <div>
                    <div className="text-sm font-bold text-emerald-400 mb-1">Strengths</div>
                    {aiData.strengths?.length > 0 ? (
                      <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                        {aiData.strengths.map((str: string, i: number) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">None detected</p>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-400 mb-1">Areas to Improve</div>
                    {aiData.areasToImprove?.length > 0 ? (
                      <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                        {aiData.areasToImprove.map((area: string, i: number) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">None detected</p>
                    )}
                  </div>
                </div>

                <Link href="/dashboard" className="btn btn-secondary w-full justify-center shrink-0">
                  Back to Dashboard
                </Link>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
