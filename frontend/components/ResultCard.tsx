"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Droplets,
    Flame,
    Mountain,
    TreeDeciduous,
    Anvil,
    ChevronDown,
    FileText,
    RefreshCw,
    Share2,
    Download,
} from "lucide-react";
import { toast } from "sonner";

interface ResultCardProps {
    result: any;
    selectedTopic: string;
    onTopicChange: (topic: string) => void;
    onShowReport: () => void;
    onUnlockDeep: () => void;
    isDeepLoading: boolean;
}

const interpretationTopics = [
    { value: "personality", label: "본질과 성격 (Personality)" },
    { value: "wealth", label: "재물운 (Wealth)" },
    { value: "career", label: "직업과 진로 (Career)" },
    { value: "health", label: "건강운 (Health)" },
    { value: "love", label: "애정운 (Love)" },
];

const getElementIcon = (element: string) => {
    switch (element) {
        case "Wood":
            return <TreeDeciduous className="w-6 h-6 text-emerald-500" />;
        case "Fire":
            return <Flame className="w-6 h-6 text-rose-500" />;
        case "Earth":
            return <Mountain className="w-6 h-6 text-amber-600" />;
        case "Metal":
            return <Anvil className="w-6 h-6 text-slate-400" />;
        case "Water":
            return <Droplets className="w-6 h-6 text-sky-500" />;
        default:
            return <Sparkles className="w-6 h-6 text-slate-400" />;
    }
};

const getElementColor = (element: string) => {
    switch (element) {
        case "Wood": return "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30";
        case "Fire": return "from-rose-500/20 to-rose-900/10 border-rose-500/30";
        case "Earth": return "from-amber-500/20 to-amber-900/10 border-amber-500/30";
        case "Metal": return "from-slate-400/20 to-slate-800/10 border-slate-400/30";
        case "Water": return "from-sky-500/20 to-sky-900/10 border-sky-500/30";
        default: return "from-yellow-500/20 to-yellow-900/10 border-yellow-500/30";
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ResultCard({
    result,
    selectedTopic,
    onTopicChange,
    onShowReport,
    onUnlockDeep,
    isDeepLoading,
}: Readonly<ResultCardProps>) {
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

    // Auto-flip cards sequentially on mount
    useEffect(() => {
        const pillars = ["year", "month", "day", "hour"];
        pillars.forEach((pillar, i) => {
            setTimeout(() => {
                setFlippedCards((prev) => ({ ...prev, [pillar]: true }));
            }, 600 + i * 300);
        });
    }, []);

    // Share as image
    const handleShareImage = async () => {
        try {
            const shareCard = document.getElementById("share-card");
            if (!shareCard) return;

            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(shareCard, {
                backgroundColor: "#0a0a12",
                scale: 2,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], "soul-stat-result.png", { type: "image/png" });
                    const shareData = { files: [file], title: "My Soul Stat" };
                    if (navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return;
                    }
                }

                // Fallback: download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "soul-stat-result.png";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("이미지가 저장되었습니다! 🖼️");
            }, "image/png");
        } catch {
            // Fallback to text share
            const text = `🔮 My Soul Stat: ${result.class}\n✨ Dominant Element: ${result.dominant_element}\n\nDiscover your destiny at Soul Stat!`;
            try {
                await navigator.clipboard.writeText(text);
                toast.success("결과가 클립보드에 복사되었습니다! 🎉");
            } catch {
                toast.error("공유에 실패했습니다.");
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl space-y-8 pb-20"
        >
            {/* Hidden Share Card (for html2canvas) */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <div
                    id="share-card"
                    className="share-card-bg"
                    style={{
                        width: 540,
                        height: 540,
                        padding: 40,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontFamily: "Cinzel, serif",
                    }}
                >
                    <div style={{ fontSize: 16, color: "#D4AF37", letterSpacing: 4, marginBottom: 12 }}>
                        SOUL STAT
                    </div>
                    <div style={{ fontSize: 36, fontWeight: "bold", marginBottom: 8, textAlign: "center" }}>
                        {result.class}
                    </div>
                    <div style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 24 }}>
                        Dominant Element: {result.dominant_element}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                        {["year", "month", "day", "hour"].map((p) => (
                            <div
                                key={p}
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(212,175,55,0.3)",
                                    borderRadius: 12,
                                    padding: "12px 16px",
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: 9, color: "#71717a", marginBottom: 4 }}>{p.toUpperCase()}</div>
                                <div style={{ fontSize: 18, color: "#D4AF37" }}>{result.pillars?.[p]?.stem}</div>
                                <div style={{ fontSize: 18, color: "#e4e4e7" }}>{result.pillars?.[p]?.branch}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#52525b" }}>soulstat.vercel.app</div>
                </div>
            </div>

            {/* Top Row: Class & Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identity Card */}
                <motion.div
                    variants={itemVariants}
                    className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${getElementColor(result.dominant_element)} p-8 shadow-none ring-1 ring-white/10 transition-all hover:ring-yellow-500/30 glow-gold`}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity scale-[3]">
                        {getElementIcon(result.dominant_element)}
                    </div>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 font-serif">
                                Soul Class
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 font-serif">{result.class}</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                {result.class_description}
                            </p>
                            <p className="text-zinc-500 text-xs font-medium">
                                Dominant Element:{" "}
                                <span className="text-yellow-400 font-bold">{result.dominant_element}</span>
                            </p>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-400">
                                    {getElementIcon(result.dominant_element)}
                                </div>
                                <div className="text-sm text-zinc-400 leading-tight">
                                    Based on your natal chart,
                                    <br /> your spirit resonates with{" "}
                                    <strong>{result.dominant_element}</strong>.
                                </div>
                            </div>
                            {/* Share Buttons */}
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShareImage}
                                    className="p-3 bg-white/5 hover:bg-yellow-500/10 rounded-2xl text-zinc-400 hover:text-yellow-400 transition-colors"
                                    title="이미지로 저장/공유"
                                >
                                    <Download className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={async () => {
                                        const text = `🔮 My Soul Stat: ${result.class}\n✨ ${result.dominant_element}\n\nsoulstat.vercel.app`;
                                        try {
                                            if (navigator.share) {
                                                await navigator.share({ title: "Soul Stat", text, url: globalThis.location.href });
                                            } else {
                                                await navigator.clipboard.writeText(text);
                                                toast.success("클립보드에 복사! 🎉");
                                            }
                                        } catch { /* cancelled */ }
                                    }}
                                    className="p-3 bg-white/5 hover:bg-yellow-500/10 rounded-2xl text-zinc-400 hover:text-yellow-400 transition-colors"
                                    title="텍스트로 공유"
                                >
                                    <Share2 className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Four Pillars Grid — Card Flip */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl bg-white/5 p-8 shadow-none ring-1 ring-white/10"
                >
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 font-serif">
                        The Four Pillars
                    </div>
                    <div className="grid grid-cols-4 gap-4 h-[calc(100%-2rem)]">
                        {["year", "month", "day", "hour"].map((pillar, i) => (
                            <div key={pillar} className="card-flip-container">
                                <motion.div
                                    initial={{ rotateY: 0 }}
                                    animate={{ rotateY: flippedCards[pillar] ? 180 : 0 }}
                                    transition={{ duration: 0.8, delay: 0, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ transformStyle: "preserve-3d" }}
                                    className="relative w-full h-full min-h-[140px]"
                                >
                                    {/* Front (unrevealed) */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="card-flip-front absolute inset-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-yellow-900/30 to-black border border-yellow-500/20 cursor-pointer"
                                        onClick={() => setFlippedCards((prev) => ({ ...prev, [pillar]: true }))}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlippedCards((prev) => ({ ...prev, [pillar]: true })); }}
                                    >
                                        <div className="text-3xl mb-2">☰</div>
                                        <span className="text-[10px] font-bold text-yellow-500/60 uppercase">
                                            {getPillarLabel(pillar)}
                                        </span>
                                        <div className="text-[9px] text-zinc-600 mt-1">Click to reveal</div>
                                    </div>
                                    {/* Back (revealed) */}
                                    <div
                                        className="card-flip-back absolute inset-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-yellow-500/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                                        style={{ transform: "rotateY(180deg)" }}
                                    >
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2 font-serif">
                                            {getPillarLabel(pillar)}
                                        </span>
                                        <div className="text-lg font-serif text-white flex flex-col items-center gap-2 text-center">
                                            <div className="text-yellow-400 font-bold leading-tight text-xl">
                                                {result.pillars[pillar].stem}
                                            </div>
                                            <div className="w-6 h-[1px] bg-yellow-500/30" />
                                            <div className="text-white/90 leading-tight text-xl">
                                                {result.pillars[pillar].branch}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Interpretation Section */}
            <motion.div
                variants={itemVariants}
                className="p-8 rounded-3xl bg-white/5 shadow-none ring-1 ring-white/10 flex flex-col"
            >
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-serif">
                        Myungseon&apos;s Insight
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={onShowReport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-lg transition-colors"
                        >
                            <FileText className="w-3 h-3" />
                            Full Report
                        </button>

                        {/* Deep Report Button with Teaser */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onUnlockDeep}
                            disabled={isDeepLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30 text-purple-200 text-xs font-bold rounded-lg transition-all"
                        >
                            {isDeepLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3 text-purple-300" />
                            )}
                            {isDeepLoading ? "Consulting..." : "Unlock Deep Book ($4.99)"}
                        </motion.button>

                        {/* Combo Box */}
                        <div className="relative">
                            <select
                                value={selectedTopic}
                                onChange={(e) => onTopicChange(e.target.value)}
                                className="appearance-none bg-black/40 border border-white/20 text-zinc-300 text-sm font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 cursor-pointer"
                            >
                                {interpretationTopics.map((topic) => (
                                    <option key={topic.value} value={topic.value}>
                                        {topic.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Teaser for Deep Report */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mb-4 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center"
                >
                    <p className="text-xs text-purple-300/70 italic font-serif">
                        &ldquo;Your hidden potential in {result.dominant_element} suggests a rare gift... Unlock the Book of Destiny to reveal more.&rdquo;
                    </p>
                </motion.div>

                <motion.div
                    key={selectedTopic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-gradient-to-br from-yellow-900/20 to-black rounded-2xl p-8 border border-yellow-500/20 flex items-center"
                >
                    <p className="text-lg leading-relaxed text-zinc-200 font-light">
                        &ldquo;{result.interpretations ? result.interpretations[selectedTopic] : result.message}&rdquo;
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
