"use client";

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

const getPillarLabel = (key: string) => {
    switch (key) {
        case "year":
            return "YEAR (년주)";
        case "month":
            return "MONTH (월주)";
        case "day":
            return "DAY (일주)";
        case "hour":
            return "HOUR (시주)";
        default:
            return key.toUpperCase();
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
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
    // Share result as image (Mari's viral loop)
    const handleShare = async () => {
        try {
            const text = `🔮 My Soul Stat: ${result.class}\n✨ Dominant Element: ${result.dominant_element}\n\nDiscover your destiny at Soul Stat!`;
            if (navigator.share) {
                await navigator.share({
                    title: "My Soul Stat Result",
                    text,
                    url: globalThis.location.href,
                });
            } else {
                await navigator.clipboard.writeText(text);
                toast.success("결과가 클립보드에 복사되었습니다! 🎉");
            }
        } catch {
            // User cancelled share, that's fine
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl space-y-8 pb-20"
        >
            {/* Top Row: Class & Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identity Card */}
                <motion.div
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 shadow-none ring-1 ring-white/10 transition-all hover:ring-yellow-500/30"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity scale-[3]">
                        {getElementIcon(result.dominant_element)}
                    </div>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                                Soul Class
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2">{result.class}</h2>
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
                            {/* Share Button (Mari's Viral Loop) */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShare}
                                className="p-3 bg-white/5 hover:bg-yellow-500/10 rounded-2xl text-zinc-400 hover:text-yellow-400 transition-colors"
                                title="Share your result"
                            >
                                <Share2 className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Four Pillars Grid */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl bg-white/5 p-8 shadow-none ring-1 ring-white/10"
                >
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">
                        The Four Pillars
                    </div>
                    <div className="grid grid-cols-4 gap-4 h-full">
                        {["year", "month", "day", "hour"].map((pillar, i) => (
                            <motion.div
                                key={pillar}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-white/10"
                            >
                                <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">
                                    {getPillarLabel(pillar)}
                                </span>
                                <div className="text-lg font-serif text-white flex flex-col items-center gap-2 text-center">
                                    <div className="text-yellow-400 font-bold leading-tight">
                                        {result.pillars[pillar].stem}
                                    </div>
                                    <div className="text-white/90 leading-tight">
                                        {result.pillars[pillar].branch}
                                    </div>
                                </div>
                            </motion.div>
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
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Myungseon's Insight
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={onShowReport}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-lg transition-colors"
                        >
                            <FileText className="w-3 h-3" />
                            Full Report
                        </button>

                        {/* Deep Report Button */}
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
