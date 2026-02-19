"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ElementalChartProps {
    stats: { Wood: number; Fire: number; Earth: number; Metal: number; Water: number };
}

const elementColors: Record<string, string> = {
    Wood: "#10b981",
    Fire: "#f43f5e",
    Earth: "#d97706",
    Metal: "#94a3b8",
    Water: "#0ea5e9",
};

export default function ElementalChart({ stats }: Readonly<ElementalChartProps>) {
    const chartData = [
        { subject: "Wood (목)", A: stats.Wood, fullMark: 5 },
        { subject: "Fire (화)", A: stats.Fire, fullMark: 5 },
        { subject: "Earth (토)", A: stats.Earth, fullMark: 5 },
        { subject: "Metal (금)", A: stats.Metal, fullMark: 5 },
        { subject: "Water (수)", A: stats.Water, fullMark: 5 },
    ];

    // Find dominant element
    const dominant = Object.entries(stats).sort(([, a], [, b]) => b - a)[0];
    const dominantColor = elementColors[dominant[0]] || "#eab308";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1 p-8 rounded-3xl bg-white/5 shadow-none ring-1 ring-white/10 flex flex-col items-center justify-center"
        >
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 w-full text-left font-serif">
                Elemental Balance
            </h3>
            <div className="w-full aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#222" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar
                            name="Stat"
                            dataKey="A"
                            stroke={dominantColor}
                            strokeWidth={2.5}
                            fill={dominantColor}
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Mini Bar Chart */}
            <div className="mt-6 grid grid-cols-5 gap-2 w-full">
                {Object.entries(stats).map(([key, val]) => (
                    <div key={key} className="text-center group">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1 group-hover:text-yellow-500 transition-colors">
                            {key}
                        </div>
                        <div className="h-16 w-full bg-white/5 rounded-xl overflow-hidden relative flex items-end justify-center pb-1">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(val / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="absolute bottom-0 w-full rounded-b-xl transition-colors"
                                style={{
                                    backgroundColor: `${elementColors[key] || "#eab308"}40`,
                                }}
                            />
                            <span className="relative z-10 text-xs font-bold text-white">{val}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
