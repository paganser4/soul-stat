"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SajuFormProps {
    birthDate: string;
    birthTime: string;
    loading: boolean;
    onBirthDateChange: (val: string) => void;
    onBirthTimeChange: (val: string) => void;
    onAnalyze: () => void;
}

export default function SajuForm({
    birthDate,
    birthTime,
    loading,
    onBirthDateChange,
    onBirthTimeChange,
    onAnalyze,
}: Readonly<SajuFormProps>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg p-8 mb-12 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-white/5"
        >
            <div className="space-y-6">
                {/* Mystical intro */}
                <div className="text-center mb-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-serif">
                        Enter Your Birth Data
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="birthDate"
                            className="block mb-2 text-xs font-bold text-yellow-500/80 uppercase tracking-widest font-serif"
                        >
                            생년월일 (Date of Birth)
                        </label>
                        <input
                            id="birthDate"
                            type="date"
                            value={birthDate}
                            onChange={(e) => onBirthDateChange(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 text-white font-medium transition-all [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="birthTime"
                            className="block mb-2 text-xs font-bold text-yellow-500/80 uppercase tracking-widest font-serif"
                        >
                            태어난 시각 (Time of Birth)
                        </label>
                        <input
                            id="birthTime"
                            type="time"
                            value={birthTime}
                            onChange={(e) => onBirthTimeChange(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 text-white font-medium transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(212,175,55,0.3)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onAnalyze}
                    disabled={loading || !birthDate || !birthTime}
                    className="w-full py-4 text-lg font-bold text-black bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500 rounded-xl hover:from-yellow-500 hover:to-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/30 font-serif"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Reading the stars...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" /> Initialize Analysis
                        </span>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
