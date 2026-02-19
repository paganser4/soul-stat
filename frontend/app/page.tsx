"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import SajuForm from "../components/SajuForm";
import ResultCard from "../components/ResultCard";
import ElementalChart from "../components/ElementalChart";
import PayPalButton from "../components/PayPalButton";

// Chapter definitions for Deep Report
const CHAPTERS = [
  { key: "essence", title: "Essence", icon: "✦" },
  { key: "strengths", title: "Strengths", icon: "⚔" },
  { key: "wealth", title: "Wealth & Career", icon: "💰" },
  { key: "heart", title: "Heart", icon: "♥" },
  { key: "health", title: "Health", icon: "🏺" },
  { key: "tides", title: "Current Tides", icon: "🌊" },
  { key: "wisdom", title: "Wisdom", icon: "📜" },
];

// Parse deep report markdown into chapters
function parseChapters(markdown: string) {
  const sections: Record<string, string> = {};
  // Split by ## headings
  const parts = markdown.split(/(?=^##\s)/m);

  const chapterKeywords: Record<string, string[]> = {
    essence: ["essence", "soul", "day master"],
    strengths: ["strength", "shadow", "hidden"],
    wealth: ["wealth", "career", "path"],
    heart: ["heart", "harmony", "love", "relationship"],
    health: ["vessel", "health", "wellness"],
    tides: ["tides", "current", "forecast", "year"],
    wisdom: ["wisdom", "sage", "final", "advice"],
  };

  for (const part of parts) {
    const lower = part.toLowerCase();
    for (const [key, keywords] of Object.entries(chapterKeywords)) {
      if (keywords.some((kw) => lower.includes(kw)) && !sections[key]) {
        sections[key] = part.trim();
        break;
      }
    }
  }

  // If parsing failed, put everything in "essence"
  if (Object.keys(sections).length === 0) {
    sections["essence"] = markdown;
  }

  return sections;
}

// Saju analysis result type
interface SajuResult {
  class: string;
  class_description: string;
  dominant_element: string;
  day_master: string;
  stats: { Wood: number; Fire: number; Earth: number; Metal: number; Water: number };
  pillars: Record<string, { stem: string; branch: string }>;
  interpretations: Record<string, string>;
  detailed_report: string;
  message: string;
}

export default function Home() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("personality");
  const [showReport, setShowReport] = useState(false);

  // AI Deep Report State
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [showDeepReport, setShowDeepReport] = useState(false);
  const [deepReportContent, setDeepReportContent] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeChapter, setActiveChapter] = useState("essence");

  // Parse chapters from deep report
  const chapters = useMemo(() => {
    if (!deepReportContent) return {};
    return parseChapters(deepReportContent);
  }, [deepReportContent]);

  const analyzeSaju = async () => {
    if (!birthDate || !birthTime) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      toast.success("분석이 완료되었습니다! ✨");
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("분석에 실패했습니다. 백엔드 연결을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    if (!result || !birthDate || !birthTime) {
      toast.warning("먼저 기본 사주 분석을 실행해 주세요.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (details: any) => {
    setShowPaymentModal(false);
    toast.success("결제가 완료되었습니다! Deep Report를 생성합니다...");
    await handleDeepAnalyze(details.id);
  };

  const handleDeepAnalyze = async (paymentId: string) => {
    setIsDeepLoading(true);
    try {
      const res = await fetch("/api/analyze/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, paymentId }),
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.deep_report) {
        setDeepReportContent(data.deep_report);
        setActiveChapter("essence");
        setShowDeepReport(true);
        toast.success("Book of Destiny가 완성되었습니다! 📖");
      } else {
        toast.error("The spirits remained silent (No report generated).");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsDeepLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-yellow-900 overflow-x-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/3 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
        {/* Starfield dots */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, rgba(212,175,55,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, rgba(212,175,55,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 40% 70%, rgba(168,85,247,0.15) 0%, transparent 100%), radial-gradient(1px 1px at 60% 50%, rgba(212,175,55,0.2) 0%, transparent 100%)",
          }}
        />
      </div>

      <main className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-2">
            SOUL STAT
          </h1>
          <p className="text-lg text-white/50 font-medium tracking-wide">
            Advanced Destiny Analysis Protocol
          </p>
          <div className="mt-4 text-xs font-semibold text-yellow-500 bg-black/40 border border-yellow-500/20 rounded-full px-4 py-1 inline-block uppercase tracking-wider font-serif">
            Ver 0.4.0 Beta
          </div>
        </motion.header>

        {/* Input Form */}
        <SajuForm
          birthDate={birthDate}
          birthTime={birthTime}
          loading={loading}
          onBirthDateChange={setBirthDate}
          onBirthTimeChange={setBirthTime}
          onAnalyze={analyzeSaju}
        />

        {/* Loading Skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 rounded-3xl bg-white/5 ring-1 ring-white/10 shimmer" />
                <div className="h-64 rounded-3xl bg-white/5 ring-1 ring-white/10 shimmer" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="h-80 rounded-3xl bg-white/5 ring-1 ring-white/10 shimmer" />
                <div className="md:col-span-2 h-80 rounded-3xl bg-white/5 ring-1 ring-white/10 shimmer" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence>
          {result && !loading && (
            <div className="w-full max-w-5xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ElementalChart stats={result.stats} />
                <div className="md:col-span-2">
                  <ResultCard
                    result={result}
                    selectedTopic={selectedTopic}
                    onTopicChange={setSelectedTopic}
                    onShowReport={() => setShowReport(true)}
                    onUnlockDeep={handleUnlockClick}
                    isDeepLoading={isDeepLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Detailed Report Modal */}
        <AnimatePresence>
          {showReport && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-3xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white">Soul Analysis Report</h2>
                    <p className="text-sm text-yellow-500/80 uppercase tracking-widest mt-1 font-serif">Full Destiny Reading</p>
                  </div>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="overflow-y-auto p-8 space-y-6 text-zinc-300 leading-relaxed">
                  <div className="whitespace-pre-wrap font-sans text-base leading-loose p-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    {result.detailed_report}
                  </div>
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors font-serif"
                  >
                    Close Report
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deep Report Modal — Chapter Tabs */}
        <AnimatePresence>
          {showDeepReport && deepReportContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">
                        Book of Destiny
                      </h2>
                      <p className="text-sm text-purple-400/60 uppercase tracking-widest mt-0.5 font-serif">
                        Myungseon&apos;s Deep Analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeepReport(false)}
                    className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Chapter Tabs */}
                <div className="flex gap-1 px-6 pt-4 pb-2 overflow-x-auto border-b border-white/5 bg-white/[0.02]">
                  {CHAPTERS.map((ch) => {
                    const hasContent = !!chapters[ch.key];
                    let tabClass = "text-zinc-700 cursor-default opacity-50";
                    if (activeChapter === ch.key) tabClass = "bg-purple-500/20 text-purple-200 active";
                    else if (hasContent) tabClass = "text-zinc-500 hover:text-zinc-300 hover:bg-white/5";
                    return (
                      <button
                        key={ch.key}
                        onClick={() => hasContent && setActiveChapter(ch.key)}
                        className={`chapter-tab flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${tabClass}`}
                      >
                        <span>{ch.icon}</span>
                        <span className="font-serif">{ch.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#0a0a0a] to-[#110518]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeChapter}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="prose prose-invert prose-purple max-w-none prose-headings:font-serif prose-headings:text-purple-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-yellow-400/90 prose-blockquote:border-l-purple-500/50 prose-blockquote:text-zinc-400 prose-blockquote:italic leading-relaxed"
                    >
                      <ReactMarkdown>
                        {chapters[activeChapter] || deepReportContent}
                      </ReactMarkdown>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer with chapter nav */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                    {CHAPTERS.map((ch) => {
                      let dotClass = "bg-zinc-800";
                      if (activeChapter === ch.key) dotClass = "bg-purple-400";
                      else if (chapters[ch.key]) dotClass = "bg-zinc-600";
                      return <div key={ch.key} className={`w-2 h-2 rounded-full transition-colors ${dotClass}`} />;
                    })}
                  </div>
                  <button
                    onClick={() => setShowDeepReport(false)}
                    className="px-6 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/5 font-serif"
                  >
                    Close Book
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0a0a] border border-yellow-500/30 text-white p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.15)] text-center"
              >
                <div className="text-yellow-500 text-sm uppercase tracking-widest mb-2 font-serif">Premium</div>
                <h2 className="text-3xl font-bold mb-4 font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                  Unlock Deep Destiny
                </h2>
                <p className="mb-6 text-zinc-400 text-sm leading-relaxed">
                  Reveal the full secrets of your fate, including a 2026 forecast, hidden strengths, and the Sage&apos;s wisdom.
                </p>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-yellow-400 font-serif mb-1">$4.99</div>
                  <div className="text-xs text-zinc-500">One-time payment</div>
                </div>
                <div className="w-full relative z-10">
                  <PayPalButton amount="4.99" onSuccess={handlePaymentSuccess} />
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-6 text-sm text-zinc-600 hover:text-zinc-300 underline transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
