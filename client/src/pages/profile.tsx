import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Player, Match, Reward } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
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
    Camera,
    Gamepad2 as Gamepad,
    Instagram,
    Youtube,
    Twitch,
    Globe,
    Settings,
    Loader2,
    Share2,
    Info,
    Star
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { RankCard } from "@/components/rank-card";
import { EvolutionChart } from "@/components/evolution-chart";

type ProfileData = {
    player: Player;
    history: (Match & { winnerName: string; loserName: string })[];
    arenaStats: {
        totalMatches: number;
        wins: number;
        losses: number;
        winRate: string;
    };
    rewards?: Reward[];
};

export default function Profile() {
    const { accountId, zoneId } = useParams();
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

    // Form state for profile editing
    const [editBio, setEditBio] = useState("");
    const [editInsta, setEditInsta] = useState("");
    const [editTwitch, setEditTwitch] = useState("");
    const [editYoutube, setEditYoutube] = useState("");

    const { data, isLoading, error } = useQuery<ProfileData>({
        queryKey: [`/api/players/${accountId}/${zoneId}`],
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (updatedData: any) => {
            const res = await apiRequest("PUT", `/api/players/${data?.player.id}`, updatedData);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/players/${accountId}/${zoneId}`] });
            toast({ title: "✨ Perfil Atualizado", description: "Suas informações foram salvas com sucesso." });
            setIsEditDialogOpen(false);
        },
        onError: () => {
            toast({ title: "Erro na atualização", variant: "destructive" });
        }
    });

    const isOwnProfile = user?.id === accountId;

    const [isRankCardOpen, setIsRankCardOpen] = useState(false);
    const [challengeMessage, setChallengeMessage] = useState("");
    const [challengeDate, setChallengeDate] = useState("");
    const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);

    const challengeMutation = useMutation({
        mutationFn: async (challengeData: any) => {
            const res = await apiRequest("POST", "/api/challenges", challengeData);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "⚔️ Desafio Enviado!", description: "Aguardando o oponente aceitar." });
            queryClient.invalidateQueries({ queryKey: [`/api/challenges/${accountId}/${zoneId}`] });
            setIsChallengeDialogOpen(false);
            setChallengeMessage("");
            setChallengeDate("");
        }
    });

    const { data: challenges } = useQuery<any[]>({
        queryKey: [`/api/challenges/${accountId}/${zoneId}`],
        enabled: !!accountId
    });

    useEffect(() => {
        if (data?.player) {
            setEditBio(data.player.bio || "");
            setEditInsta(data.player.instagram || "");
            setEditTwitch(data.player.twitch || "");
            setEditYoutube(data.player.youtube || "");
        }
    }, [data]);

    // Calculate topHeroes and winRate here
    const sortedHistory = data?.history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    const winRate = data?.arenaStats.winRate || "0";

    // Extract hero stats
    const heroStats: Record<string, { used: number; wins: number }> = {};
    data?.history.forEach(match => {
        const isWinner = match.winnerId === accountId;
        const hero = isWinner ? match.winnerHero : match.loserHero;
        if (hero) {
            if (!heroStats[hero]) heroStats[hero] = { used: 0, wins: 0 };
            heroStats[hero].used++;
            if (isWinner) heroStats[hero].wins++;
        }
    });

    const topHeroes = Object.entries(heroStats)
        .map(([name, stats]) => ({
            name,
            used: stats.used,
            winRate: Math.round((stats.wins / stats.used) * 100)
        }))
        .sort((a, b) => b.used - a.used)
        .slice(0, 3);

    const firstHero = topHeroes[0];

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

    const { player, history, arenaStats, rewards } = data;
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
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur opacity-40 animate-pulse" />
                            <img
                                src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.gameName}`}
                                className="w-32 h-32 rounded-full border-4 border-white/10 relative z-10 bg-[#0c1120] object-cover"
                                alt={player.gameName}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.gameName}`;
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                {uploadingAvatar ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadingAvatar(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append('avatar', file);
                                        const res = await fetch(`/api/players/${player.id}/avatar`, {
                                            method: 'POST',
                                            body: formData,
                                        });
                                        if (res.ok) {
                                            toast({ title: "📸 Foto atualizada!", description: "Sua nova foto de perfil está ativa." });
                                            queryClient.invalidateQueries({ queryKey: [`/api/players/${accountId}/${zoneId}`] });
                                        } else {
                                            toast({ title: "Erro ao enviar foto", variant: "destructive" });
                                        }
                                    } catch {
                                        toast({ title: "Erro de conexão", variant: "destructive" });
                                    } finally {
                                        setUploadingAvatar(false);
                                    }
                                }}
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
                                <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 uppercase text-xs tracking-widest font-bold mx-auto md:mx-0">
                                    {player.currentRank || "RANK DESCONHECIDO"}
                                </Badge>
                                {isOwnProfile && (
                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs tracking-widest uppercase h-10 px-4 font-bold">
                                                <Settings className="w-3 h-3 mr-2" />
                                                Editar Perfil
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#020617]/95 border-white/10 backdrop-blur-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="font-serif text-2xl uppercase tracking-widest text-primary">Personalizar Avatar</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-widest font-bold opacity-70">Bio / Frase de Impacto</Label>
                                                    <Input
                                                        value={editBio}
                                                        onChange={(e) => setEditBio(e.target.value)}
                                                        placeholder="Diga algo sobre você..."
                                                        className="bg-white/5 border-white/10 h-12"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold opacity-70">Instagram</Label>
                                                        <Input
                                                            value={editInsta}
                                                            onChange={(e) => setEditInsta(e.target.value)}
                                                            placeholder="@user"
                                                            className="bg-white/5 border-white/10 h-10"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold opacity-70">Twitch</Label>
                                                        <Input
                                                            value={editTwitch}
                                                            onChange={(e) => setEditTwitch(e.target.value)}
                                                            placeholder="streamer"
                                                            className="bg-white/5 border-white/10 h-10"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold opacity-70">YouTube</Label>
                                                        <Input
                                                            value={editYoutube}
                                                            onChange={(e) => setEditYoutube(e.target.value)}
                                                            placeholder="canal"
                                                            className="bg-white/5 border-white/10 h-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    className="w-full h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest"
                                                    disabled={updateProfileMutation.isPending}
                                                    onClick={() => updateProfileMutation.mutate({
                                                        accountId: player.accountId,
                                                        bio: editBio,
                                                        instagram: editInsta,
                                                        twitch: editTwitch,
                                                        youtube: editYoutube
                                                    })}
                                                >
                                                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                <Dialog open={isRankCardOpen} onOpenChange={setIsRankCardOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary [text-shadow:_0_0_10px_rgba(245,158,11,0.3)] text-xs tracking-widest uppercase h-10 px-4 font-bold ml-2 shadow-lg shadow-primary/10">
                                            <Share2 className="w-3 h-3 mr-2" />
                                            Compartilhar Glória
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-transparent border-none shadow-none p-0 flex items-center justify-center max-w-none">
                                        <div className="scale-90 sm:scale-100">
                                            {data && (
                                                <RankCard
                                                    player={data.player}
                                                    stats={{ totalMatches: data.arenaStats.totalMatches, winRate: `${winRate}%` }}
                                                    topHero={firstHero ? { name: firstHero.name, winRate: firstHero.winRate } : undefined}
                                                />
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {!isOwnProfile && user && (
                                    <Dialog open={isChallengeDialogOpen} onOpenChange={setIsChallengeDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-orange-600 hover:bg-orange-700 text-xs tracking-widest uppercase h-10 px-4 font-bold ml-2 shadow-lg shadow-orange-600/20">
                                                <Swords className="w-3 h-3 mr-2" />
                                                Lançar Desafio
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#020617] border-orange-500/20">
                                            <DialogHeader>
                                                <DialogTitle className="uppercase tracking-widest text-primary">Intimar para Combate</DialogTitle>
                                                <DialogDescription className="uppercase text-xs tracking-widest opacity-60">
                                                    Defina os termos e a hora do duelo.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                <div className="space-y-3">
                                                    <Label className="text-xs uppercase tracking-widest font-black text-primary/70">Provocação / Mensagem</Label>
                                                    <Textarea
                                                        placeholder="Ex: Vou te amassar no 1v1 de Gusion! Esteja pronto."
                                                        className="bg-white/5 border-white/10 min-h-[100px] text-xs"
                                                        value={challengeMessage}
                                                        onChange={(e) => setChallengeMessage(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-xs uppercase tracking-widest font-black text-primary/70">Horário Sugerido (BRT)</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        className="bg-white/5 border-white/10 h-12"
                                                        value={challengeDate}
                                                        onChange={(e) => setChallengeDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 uppercase font-black tracking-widest shadow-xl shadow-orange-600/20"
                                                    disabled={challengeMutation.isPending}
                                                    onClick={() => challengeMutation.mutate({
                                                        challengerId: user.id,
                                                        challengerZone: user.zoneId,
                                                        challengedId: player.accountId,
                                                        challengedZone: player.zoneId,
                                                        message: challengeMessage,
                                                        scheduledAt: challengeDate
                                                    })}
                                                >
                                                    {challengeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENVIAR DESAFIO ⚔️"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em]">
                                ID: {player.accountId} • ZONA: {player.zoneId}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                                <div className="text-left text-xs font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground block">CONTA VERIFICADA</span>
                                    <span className="text-primary">{player.currentRank || "Arena 1v1"}</span>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                                {player.instagram && (
                                    <a href={`https://instagram.com/${player.instagram}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20 transition-all">
                                        <Instagram className="w-4 h-4" />
                                    </a>
                                )}
                                {player.twitch && (
                                    <a href={`https://twitch.tv/${player.twitch}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                                        <Twitch className="w-4 h-4" />
                                    </a>
                                )}
                                {player.youtube && (
                                    <a href={`https://youtube.com/@${player.youtube}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all">
                                        <Youtube className="w-4 h-4" />
                                    </a>
                                )}
                                {player.bio && (
                                    <p className="text-xs text-muted-foreground italic font-medium ml-2">"{player.bio}"</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mb-8">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Swords className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-serif uppercase tracking-widest">Estatísticas da Arena 1v1</h3>
                    </div>

                    {/* Challenges List */}
                    {challenges && challenges.filter(c => c.status === 'pending').length > 0 && (
                        <div className="mb-8 space-y-3">
                            {challenges.filter(c => c.status === 'pending').map((challenge) => (
                                <div key={challenge.id} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                            <Swords className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-widest">
                                                {challenge.challengerId === user?.id ? "Você desafiou!" : "Novo Desafio Recebido!"}
                                            </p>
                                            <p className="text-xs text-muted-foreground uppercase">Aguardando confirmação</p>
                                        </div>
                                    </div>
                                    {challenge.challengedId === user?.id && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-widest"
                                                onClick={async () => {
                                                    await apiRequest("PATCH", `/api/challenges/${challenge.id}`, { status: 'accepted' });
                                                    queryClient.invalidateQueries({ queryKey: [`/api/challenges/${accountId}/${zoneId}`] });
                                                    toast({ title: "⚔️ Desafio Aceito!", description: "Prepare-se para o combate!" });
                                                }}
                                            >
                                                Aceitar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest"
                                                onClick={async () => {
                                                    await apiRequest("PATCH", `/api/challenges/${challenge.id}`, { status: 'rejected' });
                                                    queryClient.invalidateQueries({ queryKey: [`/api/challenges/${accountId}/${zoneId}`] });
                                                }}
                                            >
                                                Recusar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 backdrop-blur-sm">
                            <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">COMBATES NA ARENA</span>
                            <span className="text-2xl font-black">{arenaStats.totalMatches}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 backdrop-blur-sm">
                            <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">VITÓRIAS</span>
                            <span className="text-2xl font-black text-emerald-400">{arenaStats.wins}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/10 backdrop-blur-sm">
                            <span className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">DERROTAS</span>
                            <span className="text-2xl font-black text-red-400">{arenaStats.losses}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 backdrop-blur-sm">
                            <span className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1">WINRATE ARENA</span>
                            <span className="text-2xl font-black text-primary">{arenaStats.winRate}</span>
                        </div>
                    </div>
                </div>

                {/* --- NOVA SEÇÃO: VITRINE DE CONQUISTAS --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
                        <h2 className="text-3xl font-serif font-black uppercase tracking-widest text-glow">Vitrine de Relíquias</h2>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent" />
                    </div>

                    {rewards && rewards.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {rewards.map((reward, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    className="group relative cursor-pointer"
                                    onClick={() => setSelectedReward(reward)}
                                >
                                    <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${reward.rarity === 'mythic' ? 'bg-purple-500' :
                                        reward.rarity === 'legendary' ? 'bg-yellow-500' :
                                            reward.rarity === 'epic' ? 'bg-green-500' : 'bg-blue-500'
                                        }`} />
                                    <Card className="bg-[#020617]/40 border-white/5 backdrop-blur-3xl overflow-hidden h-full rounded-3xl group-hover:border-primary/30 transition-all shadow-2xl">
                                        <div className="aspect-square relative overflow-hidden flex items-center justify-center p-4">
                                            <img
                                                src={reward.icon}
                                                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                                alt={reward.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80";
                                                }}
                                            />
                                            <Badge className={`absolute bottom-2 left-1/2 -translate-x-1/2 uppercase text-[10px] font-black ${reward.rarity === 'mythic' ? 'bg-purple-600' :
                                                reward.rarity === 'legendary' ? 'bg-yellow-600' :
                                                    reward.rarity === 'epic' ? 'bg-green-600' : 'bg-blue-600'
                                                }`}>
                                                {reward.rarity}
                                            </Badge>

                                            {/* Quick Info Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="p-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary">
                                                    <Info className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 text-center border-t border-white/5">
                                            <span className="text-xs font-black uppercase tracking-tighter truncate block mb-2">{reward.name}</span>
                                            <div className="flex justify-center gap-0.5">
                                                {Array.from({ length: reward.stars || 1 }).map((_, s) => (
                                                    <Star key={s} className="w-2.5 h-2.5 fill-primary text-primary" />
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center rounded-3xl">
                            <p className="text-muted-foreground italic text-sm tracking-widest uppercase mb-4">A vitrine está vazia... por enquanto.</p>
                            <Link href="/rankings">
                                <Button variant="outline" className="text-xs font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5">Buscar Glória</Button>
                            </Link>
                        </Card>
                    )}

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
                                            <img
                                                src={selectedReward.icon}
                                                className="w-full h-full object-cover"
                                                alt={selectedReward.name}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                        </div>

                                        <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Badge className="uppercase font-black tracking-[0.2em] bg-primary/20 text-primary border-primary/20">
                                                        {selectedReward.rarity}
                                                    </Badge>
                                                    <DialogTitle className="text-4xl font-serif font-black uppercase text-white leading-tight">
                                                        {selectedReward.name}
                                                    </DialogTitle>
                                                </div>

                                                <div className="flex gap-1 py-4 border-y border-white/5">
                                                    {Array.from({ length: selectedReward.stars || 1 }).map((_, s) => (
                                                        <Star key={s} className="w-5 h-5 fill-primary text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                                    ))}
                                                    <span className="ml-4 text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center">Raridade {selectedReward.stars}/7</span>
                                                </div>

                                                <DialogDescription className="text-sm text-muted-foreground leading-loose italic">
                                                    "{selectedReward.description}"
                                                </DialogDescription>
                                            </div>

                                            <div className="pt-8 space-y-4">
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <Shield className="w-6 h-6 text-primary" />
                                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">
                                                        ITEM AUTÊNTICO • WMYTHIC
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => setSelectedReward(null)}
                                                    className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl"
                                                >
                                                    FECHAR
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </DialogContent>
                    </Dialog>
                </motion.div>
                {/* --- FIM DA SEÇÃO: VITRINE --- */}

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
                                        <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest line-clamp-1">{stat.label}</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Evolution Chart */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-serif uppercase tracking-widest">Jornada de Gigante</h3>
                        </div>
                        <EvolutionChart history={history} currentPoints={player.points} accountId={player.accountId} />
                    </div>

                    {/* Top Heroes Section */}
                    {topHeroes.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                                <Gamepad className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-xl font-serif uppercase tracking-widest">Estatísticas de Heróis</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {topHeroes.map((hero, i) => (
                                    <Card key={hero.name} className="bg-white/5 border-white/10 overflow-hidden group hover:border-emerald-500/30 transition-all">
                                        <CardContent className="p-0">
                                            <div className="flex items-center p-4 gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                                                    <span className="text-xl font-black text-emerald-500">{i + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-white">{hero.name}</h4>
                                                    <div className="flex items-center gap-3 text-xs uppercase font-bold tracking-tighter mt-1">
                                                        <span className="text-muted-foreground">{hero.used} PARTIDAS</span>
                                                        <span className="text-emerald-400">{hero.winRate}% WR</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-1 w-full bg-white/5">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                                    style={{ width: `${hero.winRate}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}


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
                                                        <span className="text-muted-foreground text-xs">• {new Date(match.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-serif">vs <span className="uppercase text-white">{opponentName}</span></p>
                                                        {match.winnerHero && (
                                                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-xs font-bold">
                                                                <span className="text-emerald-400">{isWinner ? match.winnerHero : match.loserHero}</span>
                                                                <span className="opacity-30">vs</span>
                                                                <span className="text-rose-400">{isWinner ? match.loserHero : match.winnerHero}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-xl font-black ${isWinner ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {isWinner ? '+50' : '-20'}
                                                    <span className="text-xs text-muted-foreground ml-1 uppercase">pts</span>
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
