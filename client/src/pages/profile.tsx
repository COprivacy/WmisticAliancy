import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Player, Match } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy,
    Swords,
    Target,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    Calendar,
    Flame,
    Award,
    Gamepad
} from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type ProfileData = {
    player: Player;
    history: (Match & { winnerName: string; loserName: string })[];
    liveStats: {
        totalMatches: number;
        overallWinrate: string;
        mainRole: string;
        favoriteHero: string;
        rankIcon: string;
    };
};

export default function Profile() {
    const { accountId, zoneId } = useParams();
    const [, setLocation] = useLocation();

    const { data, isLoading, error } = useQuery<ProfileData>({
        queryKey: [`/api/players/${accountId}/${zoneId}`],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 className="w-12 h-12 text-primary" />
                </motion.div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-6">
                <h2 className="text-2xl font-serif mb-4 uppercase">Soldado não encontrado</h2>
                <Button onClick={() => setLocation("/rankings")} variant="outline">Voltar para Rankings</Button>
            </div>
        );
    }

    const { player, history, liveStats } = data;
    const winRate = player.wins + player.losses > 0
        ? Math.round((player.wins / (player.wins + player.losses)) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 relative">
            {/* Cinematic Hero Background */}
            <div
                className="fixed inset-0 z-[-1] opacity-30 pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/login-bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(0.3) contrast(1.1) brightness(0.6)'
                }}
            />

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => setLocation("/rankings")}
                    className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white group transition-all"
                >
                    <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    VOLTAR AOS RANKINGS
                </Button>

                {/* Header Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl mb-8 overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur opacity-40 animate-pulse" />
                            <img
                                src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.gameName}`}
                                className="w-32 h-32 rounded-full border-4 border-white/10 relative z-10 bg-[#0c1120]"
                                alt={player.gameName}
                            />
                            {player.streak >= 3 && (
                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-2 rounded-full shadow-lg z-20">
                                    <Flame className="w-5 h-5 fill-current" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-glow">{player.gameName}</h1>
                                <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 uppercase text-[10px] tracking-widest font-bold mx-auto md:mx-0">
                                    {player.currentRank || "RANK DESCONHECIDO"}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em]">
                                ID: {player.accountId} • ZONA: {player.zoneId}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                                <img src={liveStats.rankIcon} className="w-8 h-8 object-contain" alt="Rank MLBB" />
                                <div className="text-left text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground block">MOBILE LEGENDS RANK</span>
                                    <span className="text-primary">{player.currentRank}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Live Game Stats Section (MODERN) */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Gamepad className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-serif uppercase tracking-widest">Global MLBB Info</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 backdrop-blur-sm">
                            <span className="block text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">PARTIDAS TOTAIS</span>
                            <span className="text-2xl font-black">{liveStats.totalMatches}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 backdrop-blur-sm">
                            <span className="block text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-1">WINRATE GLOBAL</span>
                            <span className="text-2xl font-black">{liveStats.overallWinrate}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10 backdrop-blur-sm">
                            <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-widest mb-1">ROTA PRINCIPAL</span>
                            <span className="text-2xl font-black uppercase">{liveStats.mainRole}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10 backdrop-blur-sm">
                            <span className="block text-[8px] font-bold text-purple-400 uppercase tracking-widest mb-1">HERÓI FAVORITO</span>
                            <span className="text-2xl font-black uppercase">{liveStats.favoriteHero}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - League Stats */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h3 className="text-xl font-serif uppercase tracking-widest">Estatísticas da Liga</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "PONTOS DE LIGA", value: player.points, icon: Trophy, color: "text-amber-400" },
                            { label: "VITÓRIAS", value: player.wins, icon: Swords, color: "text-emerald-400" },
                            { label: "DERROTAS", value: player.losses, icon: Target, color: "text-rose-400" },
                            { label: "TAXA DE VITÓRIA", value: `${winRate}%`, icon: TrendingUp, color: "text-blue-400" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="bg-white/5 border-white/10 h-full backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
                                        <span className="text-2xl font-black mb-1">{stat.value}</span>
                                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest line-clamp-1">{stat.label}</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Match History */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-serif uppercase tracking-widest">Registros de Combate</h3>
                        </div>

                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                                    <Gamepad className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground uppercase tracking-widest text-xs">Nenhum duelo registrado oficialmente.</p>
                                </div>
                            ) : (
                                history.map((match, i) => {
                                    const isWinner = match.winnerId === player.accountId && match.winnerZone === player.zoneId;
                                    const opponentName = isWinner ? match.loserName : match.winnerName;

                                    return (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (i * 0.1) }}
                                            className="group relative flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all overflow-hidden"
                                        >
                                            <div className={`absolute left-0 top-0 w-1 h-full ${isWinner ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                                            <div className="flex items-center gap-6">
                                                <div className={`p-3 rounded-xl ${isWinner ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                    {isWinner ? (
                                                        <Award className="w-6 h-6 text-emerald-500" />
                                                    ) : (
                                                        <TrendingDown className="w-6 h-6 text-rose-500" />
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-sm font-bold uppercase tracking-widest ${isWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {isWinner ? 'VITÓRIA' : 'DERROTA'}
                                                        </span>
                                                        <span className="text-muted-foreground text-[10px]">• {new Date(match.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-lg font-serif">vs <span className="uppercase text-white">{opponentName}</span></p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-xl font-black ${isWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {isWinner ? '+50' : '-20'}
                                                    <span className="text-[10px] text-muted-foreground ml-1 uppercase">pts</span>
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
