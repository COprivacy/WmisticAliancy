import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Target, Download, Share2, Loader2, Star, ShieldCheck } from "lucide-react";
import { Player } from "@shared/schema";
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RankCardProps {
    player: Player;
    stats: {
        totalMatches: number;
        winRate: string;
    };
    topHero?: {
        name: string;
        winRate: number;
    };
}

export function RankCard({ player, stats, topHero }: RankCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = React.useState(false);

    const downloadCard = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `WMythic-Card-${player.gameName}.png`;
            link.href = dataUrl;
            link.click();
            toast({ title: "✨ Glória Capturada!", description: "Seu card de rank foi salvo com sucesso." });
        } catch (err) {
            toast({ title: "Erro ao gerar card", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* The Card to be captured */}
            <div className="overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-primary/50 via-primary/10 to-transparent">
                <div
                    ref={cardRef}
                    className="relative w-[350px] aspect-[4/5] bg-[#020617] overflow-hidden p-6 flex flex-col justify-between"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)`
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    />

                    {/* Header */}
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase">Membro Vitalício</span>
                            <span className="text-[8px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">WMYTHIC CLAN • 2024</span>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-primary/40" />
                    </div>

                    {/* Avatar & Name */}
                    <div className="text-center space-y-4 relative z-10">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <img
                                src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.accountId}&backgroundColor=b6e3f4`}
                                className="w-32 h-32 rounded-full border-4 border-primary/40 relative z-10 shadow-2xl mx-auto backdrop-blur-sm"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-4 border-[#020617] z-20">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-serif font-black uppercase tracking-widest text-glow">{player.gameName}</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-60">ID: {player.accountId}#{player.zoneId}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center items-center backdrop-blur-md">
                            <Trophy className="w-4 h-4 text-primary mb-1" />
                            <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Rank Atual</span>
                            <span className="text-sm font-black text-primary">{player.currentRank || "Gladiador"}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center items-center backdrop-blur-md">
                            <Target className="w-4 h-4 text-emerald-400 mb-1" />
                            <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Win Rate</span>
                            <span className="text-sm font-black text-emerald-400">{stats.winRate}</span>
                        </div>
                    </div>

                    {/* Hero Info */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 relative z-10">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Swords className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[8px] uppercase font-black tracking-[0.2em] text-primary/60 block">Main Hero Especialista</span>
                            <span className="text-lg font-serif font-black uppercase tracking-widest">{topHero?.name || "Versátil"}</span>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={downloadCard}
                    disabled={isGenerating}
                    className="flex-1 bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    Download Card
                </Button>
            </div>
        </div>
    );
}

