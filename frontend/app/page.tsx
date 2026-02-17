"use client";

import { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Sparkles, Droplets, Flame, Mountain, TreeDeciduous, Anvil, ChevronDown, X, FileText, BookOpen, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PayPalButton from '../components/PayPalButton';

export default function Home() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("personality");
  const [showReport, setShowReport] = useState(false);

  // AI Deep Report State
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [showDeepReportValues, setShowDeepReportValues] = useState(false);
  const [deepReportContent, setDeepReportContent] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // References for inputs to access values inside helper functions if needed, 
  // though we are using state (birthDate, birthTime) which is fine.
  // Actually, handleDeepAnalyze uses state directly?
  // Let's verify: handleDeepAnalyze uses `birthDate` and `birthTime` from state.
  // We don't need refs if we use state.

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
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    if (!result || !birthDate || !birthTime) {
      alert("Please generate a basic Saju analysis first.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (details: any) => {
    setShowPaymentModal(false);
    console.log("Payment Successful:", details);

    // Proceed to deep analysis
    await handleDeepAnalyze();
  };

  const handleDeepAnalyze = async () => {
    // Determine if we need to check payment validity on backend? 
    // For now, we trust the frontend success callback for MVP.

    setIsDeepLoading(true);

    try {
      // Use the new deep analysis route
      const res = await fetch("/api/analyze/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime,
          // paymentId: details.id // We could pass this if we threaded it
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // The deep report is in data.deep_report (markdown)
      if (data.deep_report) {
        setDeepReportContent(data.deep_report);
        setShowDeepReportValues(true);
      } else {
        alert("The spirits remained silent (No report generated).");
      }

    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDeepLoading(false);
    }
  };

  // Transform stats for Radar Chart
  const chartData = result ? [
    { subject: 'Wood (목)', A: result.stats.Wood, fullMark: 5 },
    { subject: 'Fire (화)', A: result.stats.Fire, fullMark: 5 },
    { subject: 'Earth (토)', A: result.stats.Earth, fullMark: 5 },
    { subject: 'Metal (금)', A: result.stats.Metal, fullMark: 5 },
    { subject: 'Water (수)', A: result.stats.Water, fullMark: 5 },
  ] : [];

  const getElementIcon = (element: string) => {
    switch (element) {
      case "Wood": return <TreeDeciduous className="w-6 h-6 text-emerald-500" />;
      case "Fire": return <Flame className="w-6 h-6 text-rose-500" />;
      case "Earth": return <Mountain className="w-6 h-6 text-amber-600" />;
      case "Metal": return <Anvil className="w-6 h-6 text-slate-400" />;
      case "Water": return <Droplets className="w-6 h-6 text-sky-500" />;
      default: return <Sparkles className="w-6 h-6 text-slate-400" />;
    }
  };

  const getPillarLabel = (key: string) => {
    switch (key) {
      case "year": return "YEAR (년주)";
      case "month": return "MONTH (월주)";
      case "day": return "DAY (일주)";
      case "hour": return "HOUR (시주)";
      default: return key.toUpperCase();
    }
  };

  const interpretationTopics = [
    { value: "personality", label: "본질과 성격 (Personality)" },
    { value: "wealth", label: "재물운 (Wealth)" },
    { value: "career", label: "직업과 진로 (Career)" },
    { value: "health", label: "건강운 (Health)" },
    { value: "love", label: "애정운 (Love)" },
  ];

  return (
    <div className="min-h-screen bg-black/90 text-white font-sans selection:bg-yellow-900 overflow-x-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('/bg-texture.png')] bg-cover bg-center bg-fixed bg-black/90"></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/60 backdrop-blur-[2px]"></div>

      <main className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        {/* Header / Brand */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-2">
            SOUL STAT
          </h1>
          <p className="text-lg text-white/60 font-medium">
            Advanced Destiny Analysis Protocol
          </p>
          <div className="mt-4 text-xs font-semibold text-yellow-500 bg-black/40 border border-yellow-500/30 rounded-full px-4 py-1 inline-block uppercase tracking-wider">
            Ver 0.3.0 Beta
          </div>
        </header>

        {/* Input Section */}
        <div className="w-full max-w-lg p-8 mb-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/5">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="birthDate" className="block mb-2 text-xs font-bold text-yellow-500/80 uppercase tracking-widest">
                  Date of Birth
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 text-white font-medium transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label htmlFor="birthTime" className="block mb-2 text-xs font-bold text-yellow-500/80 uppercase tracking-widest">
                  Time of Birth
                </label>
                <input
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 text-white font-medium transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              onClick={analyzeSaju}
              disabled={loading || !birthDate || !birthTime}
              className="w-full py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl hover:from-yellow-500 hover:to-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Analyzing...
                </span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Initialize Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="w-full max-w-5xl animate-fade-in-up space-y-8 pb-20">

            {/* Top Row: Class & Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identity Card */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 shadow-none ring-1 ring-white/10 transition-all hover:ring-yellow-500/30">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  {getElementIcon(result.dominant_element)}
                </div>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Soul Class</div>
                    <h2 className="text-4xl font-black text-white mb-2">{result.class}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">{result.class_description}</p>
                    <p className="text-zinc-500 text-xs font-medium">Dominant Element: <span className="text-yellow-400 font-bold">{result.dominant_element}</span></p>
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400">
                      {getElementIcon(result.dominant_element)}
                    </div>
                    <div className="text-sm text-zinc-400 leading-tight">
                      Based on your natal chart, <br /> your spirit resonates with <strong>{result.dominant_element}</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Four Pillars Grid */}
              <div className="rounded-3xl bg-white/5 p-8 shadow-none ring-1 ring-white/10">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">The Four Pillars</div>
                <div className="grid grid-cols-4 gap-4 h-full">
                  {['year', 'month', 'day', 'hour'].map((pillar) => (
                    <div key={pillar} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-white/10">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{getPillarLabel(pillar)}</span>
                      <div className="text-lg font-serif text-white flex flex-col items-center gap-2 text-center">
                        <div className="text-yellow-400 font-bold leading-tight">{result.pillars[pillar].stem}</div>
                        <div className="text-white/90 leading-tight">{result.pillars[pillar].branch}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Chart & Interpretation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Radar Chart */}
              <div className="md:col-span-1 p-8 rounded-3xl bg-white/5 shadow-none ring-1 ring-white/10 flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 w-full text-left">Elemental Balance</h3>
                <div className="w-full aspect-square">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name="Stat"
                        dataKey="A"
                        stroke="#eab308"
                        strokeWidth={3}
                        fill="#eab308"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Interpretation */}
              <div className="md:col-span-2 p-8 rounded-3xl bg-white/5 shadow-none ring-1 ring-white/10 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Myungseon's Insight</h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReport(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-lg transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Full Report
                    </button>

                    {/* Deep Report Button */}
                    <button
                      onClick={handleUnlockClick}
                      disabled={isDeepLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30 text-purple-200 text-xs font-bold rounded-lg transition-all animate-shimmer"
                    >
                      {isDeepLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-300" />}
                      {isDeepLoading ? "Consulting..." : "Unlock Deep Book ($5)"}
                    </button>
                    {/* Combo Box */}
                    <div className="relative">
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="appearance-none bg-black/40 border border-white/20 text-zinc-300 text-sm font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 cursor-pointer"
                      >
                        {interpretationTopics.map(topic => (
                          <option key={topic.value} value={topic.value}>{topic.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-gradient-to-br from-yellow-900/20 to-black rounded-2xl p-8 border border-yellow-500/20 flex items-center">
                  <p className="text-lg leading-relaxed text-zinc-200 font-light">
                    "{result.interpretations ? result.interpretations[selectedTopic] : result.message}"
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-5 gap-3">
                  {Object.entries(result.stats).map(([key, val]: any) => (
                    <div key={key} className="text-center group">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase mb-2 group-hover:text-yellow-500 transition-colors">{key}</div>
                      <div className="h-24 w-full bg-white/5 rounded-2xl overflow-hidden relative flex items-end justify-center pb-2">
                        <div
                          className="absolute bottom-0 w-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors rounded-b-2xl"
                          style={{ height: `${(val / 8) * 100}%` }}
                        ></div>
                        <span className="relative z-10 text-sm font-bold text-white">{val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Detailed Report Modal */}
        {showReport && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Soul Analysis Report</h2>
                  <p className="text-sm text-yellow-500/80 uppercase tracking-widest mt-1">Full Destiny Reading</p>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-8 space-y-6 text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-yellow-500/20 scrollbar-track-transparent">
                <div className="whitespace-pre-wrap font-sans text-base leading-loose p-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                  {result.detailed_report}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => setShowReport(false)}
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deep Report Modal (Markdown) */}
        {showDeepReportValues && deepReportContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">Book of Destiny</h2>
                    <p className="text-sm text-purple-400/60 uppercase tracking-widest mt-0.5">Myungseon's Deep Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeepReportValues(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#110518]">
                <div className="prose prose-invert prose-purple max-w-none prose-headings:font-serif prose-headings:text-purple-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-yellow-400/90 leading-relaxed">
                  <ReactMarkdown>{deepReportContent}</ReactMarkdown>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => setShowDeepReportValues(false)}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/5"
                >
                  Close Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-[#d4af37] text-[#d4af37] p-8 rounded-lg max-w-md w-full shadow-[0_0_30px_#d4af37] text-center">
              <h2 className="text-2xl font-bold mb-4 font-serif">Unlock Deep Destiny</h2>
              <p className="mb-6 text-gray-300">
                Reveal the full secrets of your fate, including a 2026 forecast and hidden strengths.
              </p>
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">$5.00</div>
                <div className="text-sm text-gray-400">One-time payment</div>
              </div>

              <div className="w-full relative z-10">
                <PayPalButton
                  amount="5.00"
                  onSuccess={handlePaymentSuccess}
                />
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="mt-6 text-sm text-gray-500 hover:text-gray-300 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
