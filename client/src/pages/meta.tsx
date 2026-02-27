import { useQuery } from "@tanstack/react-query";
import { Match } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Target, TrendingUp, BarChart3, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Meta() {
    const { data: matches, isLoading } = useQuery<Match[]>({
        queryKey: ["/api/matches/approved"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    // Calculate Global Hero Stats
    const heroStats = (matches || []).reduce((acc: Record<string, { used: number; wins: number }>, m) => {
        const winner = m.winnerHero;
        const loser = m.loserHero;

        if (winner) {
            if (!acc[winner]) acc[winner] = { used: 0, wins: 0 };
            acc[winner].used++;
            acc[winner].wins++;
        }
        if (loser) {
            if (!acc[loser]) acc[loser] = { used: 0, wins: 0 };
            acc[loser].used++;
        }
        return acc;
    }, {});

    const sortedHeroes = Object.entries(heroStats)
        .map(([name, stats]) => ({
            name,
            ...stats,
            winRate: Math.round((stats.wins / stats.used) * 100)
        }))
        .sort((a, b) => b.winRate - a.winRate || b.used - a.used);

    const pickRateHeroes = [...sortedHeroes].sort((a, b) => b.used - a.used);

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 relative px-4 pt-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/rankings">
                    <Button variant="ghost" className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white group">
                        <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        VOLTAR
                    </Button>
                </Link>

                <div className="mb-12 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <BarChart3 className="w-10 h-10 text-primary animate-pulse" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-glow">Meta da Guilda</h1>
                    </div>
                    <p className="text-muted-foreground uppercase tracking-[0.3em] text-sm">Os heróis mais dominantes da arena</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Win Rate Tier List */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Trophy className="w-6 h-6 text-amber-400" />
                            <h2 className="text-xl font-serif uppercase tracking-widest">Maiores Win Rates</h2>
                        </div>
                        <div className="space-y-3">
                            {sortedHeroes.map((hero, i) => (
                                <motion.div
                                    key={hero.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${i === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                i === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                    i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/10 text-white/50'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold uppercase tracking-widest">{hero.name}</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{hero.used} PARTIDAS</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary">{hero.winRate}%</span>
                                        <p className="text-[8px] text-primary/50 uppercase tracking-widest font-bold">WIN RATE</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Popularity Tier List */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Swords className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-serif uppercase tracking-widest">Mais Escolhidos</h2>
                        </div>
                        <div className="space-y-3">
                            {pickRateHeroes.map((hero, i) => (
                                <motion.div
                                    key={hero.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold uppercase tracking-widest">{hero.name}</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{hero.winRate}% WIN RATE</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-blue-400">{hero.used}</span>
                                        <p className="text-[8px] text-blue-400/50 uppercase tracking-widest font-bold">PICKS</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
