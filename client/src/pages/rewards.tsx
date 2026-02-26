import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Star, Sparkles, Shield, Loader2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Rewards() {
    const { data: rewards, isLoading } = useQuery<Reward[]>({
        queryKey: ["/api/rewards"],
    });

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case "mythic": return "text-purple-400 border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
            case "legendary": return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
            case "epic": return "text-green-400 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
            case "rare": return "text-blue-400 border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.4)]";
            default: return "text-slate-400 border-slate-500/50 bg-slate-500/10";
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case "mythic": return "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border-purple-500/30";
            case "legendary": return "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] border-yellow-500/30";
            case "epic": return "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] border-green-500/30";
            case "rare": return "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border-blue-500/30";
            default: return "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 relative overflow-hidden">
            {/* Cinematic Background */}
            <div
                className="fixed inset-0 z-[-1] opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/login-bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(0.5) contrast(1.2) brightness(0.4)'
                }}
            />
            <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 pt-8 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <Link href="/rankings">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white group">
                            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </Button>
                    </Link>
                    <div className="text-right">
                        <Badge className="bg-primary text-primary-foreground uppercase tracking-widest px-4 mb-2">Relíquias da Temporada</Badge>
                        <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-glow">Santuário de Recompensas</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {rewards?.map((reward, index) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <Card className={`h-full bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 transform group-hover:-translate-y-2 ${getRarityGlow(reward.rarity)}`}>
                                <div className="relative aspect-square overflow-hidden bg-black/40">
                                    <img
                                        src={reward.icon}
                                        alt={reward.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80"; // Fallback abstract image
                                        }}
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80`} />

                                    <div className="absolute top-4 right-4">
                                        <Badge className={`uppercase font-black tracking-widest ${getRarityColor(reward.rarity)}`}>
                                            {reward.rarity}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-xl font-black uppercase group-hover:text-primary transition-colors">{reward.name}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        "{reward.description}"
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {Array.from({ length: reward.rarity === 'mythic' ? 7 : reward.rarity === 'legendary' ? 5 : reward.rarity === 'epic' ? 3 : 1 }).map((_, s) => (
                                                <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Recompensa Exclusiva</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 p-12 rounded-[3rem] border border-primary/20 bg-primary/5 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <h3 className="text-3xl font-serif font-bold uppercase tracking-widest text-primary mb-4">Como conquistar?</h3>
                    <p className="max-w-2xl mx-auto text-muted-foreground italic mb-0 leading-relaxed">
                        As recompensas são distribuídas pelo conselho da guilda ao final de cada temporada.
                        Mantenha-se no topo do Ranking 1v1 para garantir as peças mais raras do santuário.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        <Shield className="w-8 h-8 text-blue-500 animate-bounce delay-100" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
