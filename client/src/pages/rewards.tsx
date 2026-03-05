import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, Shield, Loader2, ChevronLeft, Info, X, Play, Pause, Music } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Coins, ShoppingCart } from "lucide-react";

export default function Rewards() {
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [previewingId, setPreviewingId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { data: rewards, isLoading } = useQuery<Reward[]>({
        queryKey: ["/api/rewards"],
    });

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPreviewingId(null);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePreview = (e: React.MouseEvent | React.FocusEvent, reward: Reward) => {
        e.stopPropagation();
        if (!audioRef.current) return;

        if (previewingId === reward.id) {
            audioRef.current.pause();
            setPreviewingId(null);
        } else {
            audioRef.current.src = reward.effect || "";
            audioRef.current.play().catch(console.error);
            setPreviewingId(reward.id);
        }
    };

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
                    <div className="text-right flex flex-col items-end">
                        <Badge className="bg-primary text-primary-foreground uppercase tracking-widest px-4 mb-2">Relíquias da Temporada</Badge>
                        <div className="flex items-center gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 text-primary transition-colors">
                                        <Info className="w-6 h-6" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-slate-900/95 backdrop-blur-xl border-primary/20 text-[10px] text-muted-foreground uppercase tracking-[0.15em] leading-loose p-6 shadow-2xl z-50">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                                            <ShoppingCart className="w-4 h-4 text-primary" />
                                            <h4 className="font-black text-primary">Antiquário da Guilda</h4>
                                        </div>
                                        <p>Seja bem-vindo à boutique de glória. Aqui sua honra se transforma em estilo.</p>
                                        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                            <div className="flex items-center gap-2 text-white font-bold mb-1">
                                                <Coins className="w-3 h-3 text-orange-400" />
                                                Moedas de Glória:
                                            </div>
                                            <p>Ganhe vencendo duelos oficiais na Arena ou através de bônus administrativos por mérito.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-bold">O que você encontra aqui:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Molduras Épicas para o seu Avatar</li>
                                                <li>Fundos Animados para o seu Perfil</li>
                                                <li>Trilhas Sonoras Personalizadas (MP3)</li>
                                            </ul>
                                        </div>
                                        <p className="text-[8px] italic opacity-50 text-center">Itens comprados são permanentes e intransferíveis.</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-glow">Loja WMythic</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {rewards?.map((reward, index) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedReward(reward)}
                        >
                            <Card className={`h-full bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 transform group-hover:-translate-y-2 ${getRarityGlow(reward.rarity)}`}>
                                <div className="relative aspect-square overflow-hidden bg-black/40">
                                    {reward.effect && reward.effect.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                        <video
                                            src={reward.effect}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={reward.icon}
                                            alt={reward.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80"; // Fallback abstract image
                                            }}
                                        />
                                    )}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80`} />

                                    <div className="absolute top-4 right-4">
                                        <Badge className={`uppercase font-black tracking-widest ${getRarityColor(reward.rarity)}`}>
                                            {reward.rarity}
                                        </Badge>
                                    </div>

                                    {/* Quick Info Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-4">
                                        {reward.type === 'music' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100"
                                                onClick={(e) => togglePreview(e, reward)}
                                            >
                                                {previewingId === reward.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                            </Button>
                                        )}
                                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white scale-90 group-hover:scale-100">
                                            <Info className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <CardHeader className="relative pb-2">
                                    <CardTitle className={`text-xl font-black uppercase transition-colors ${reward.effect ? reward.effect : 'group-hover:text-primary'}`}>{reward.name}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">
                                        "{reward.description}"
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: reward.stars || 1 }).map((_, s) => (
                                                <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <span className="text-[8px] uppercase font-black tracking-[0.2em] text-primary/50">Relíquia Nível {reward.stars}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Reward Detail Dialog */}
                <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
                    <DialogContent className="bg-slate-950/90 border-white/10 backdrop-blur-3xl p-0 overflow-hidden max-w-2xl rounded-[3rem]">
                        <AnimatePresence>
                            {selectedReward && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col md:flex-row h-full"
                                >
                                    <div className="w-full md:w-1/2 relative bg-black">
                                        {selectedReward.effect && selectedReward.effect.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                            <video
                                                src={selectedReward.effect}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={selectedReward.icon}
                                                className="w-full h-full object-cover"
                                                alt={selectedReward.name}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    </div>

                                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Badge className={`uppercase font-black tracking-[0.2em] ${getRarityColor(selectedReward.rarity)}`}>
                                                    {selectedReward.rarity}
                                                </Badge>
                                                <DialogTitle className={`text-4xl font-serif font-black uppercase leading-tight ${selectedReward.effect || 'text-white'}`}>
                                                    {selectedReward.name}
                                                </DialogTitle>
                                            </div>

                                            <div className="flex gap-1 py-4 border-y border-white/5">
                                                {Array.from({ length: selectedReward.stars || 1 }).map((_, s) => (
                                                    <Star key={s} className="w-5 h-5 fill-primary text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                                ))}
                                                <span className="ml-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center">Raridade {selectedReward.stars}/7</span>
                                            </div>

                                            <DialogDescription className="text-sm text-muted-foreground leading-loose italic">
                                                "{selectedReward.description}"
                                            </DialogDescription>

                                            {selectedReward.type === 'music' && (
                                                <div className="flex flex-col gap-4 p-6 rounded-3xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-2xl bg-primary/20 text-primary ${previewingId === selectedReward.id ? 'animate-pulse' : ''}`}>
                                                            <Music className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">Prévia da Faixa</p>
                                                            <p className="text-sm font-bold text-white uppercase tracking-wider">{selectedReward.name}</p>
                                                        </div>
                                                        <Button
                                                            size="lg"
                                                            className="rounded-2xl bg-primary text-white hover:bg-primary/80 h-14 w-14 p-0"
                                                            onClick={(e) => togglePreview(e, selectedReward)}
                                                        >
                                                            {previewingId === selectedReward.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-8 space-y-4">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <Shield className="w-6 h-6 text-primary" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                                    AUTENTICIDADE GARANTIDA PELA ALIANÇA
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => setSelectedReward(null)}
                                                className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                                            >
                                                FECHAR RELIQUÁRIO
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </DialogContent>
                </Dialog>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 p-12 rounded-[3rem] border border-primary/20 bg-primary/5 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <h3 className="text-3xl font-serif font-bold uppercase tracking-widest text-primary mb-4">Como conquistar?</h3>
                    <p className="max-w-2xl mx-auto text-muted-foreground italic mb-0 leading-relaxed text-sm">
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
