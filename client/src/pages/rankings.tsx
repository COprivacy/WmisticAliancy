import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Swords,
  Target,
  TrendingUp,
  ChevronRight,
  Search,
  Crown,
  Flame,
  Loader2,
  Calendar,
  Image as ImageIcon,
  X,
  Gift,
  BarChart3,
  Zap,
  Star,
  Sparkles,
  Award,
  Timer as ClockIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Player, Reward } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ActivityFeed from "@/components/activity-feed";
import { SearchableSelect } from "@/components/searchable-select";
import { MLBB_HEROES } from "@/lib/constants";

type PlayerWithRewards = Player & { rewards: Reward[] };
type SeasonInfo = {
  name: string;
  endsAt: string;
  prizes: { rank: string; prize: string }[];
};

export default function Rankings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportOpponentId, setReportOpponentId] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [winnerHero, setWinnerHero] = useState<string>("");
  const [loserHero, setLoserHero] = useState<string>("");

  const heroOptions = MLBB_HEROES.map(h => ({ label: h, value: h }));

  const [searchQuery, setSearchQuery] = useState("");

  const { data: players, isLoading } = useQuery<PlayerWithRewards[]>({
    queryKey: ["/api/players"],
  });

  const { data: season } = useQuery<SeasonInfo>({
    queryKey: ["/api/season"],
  });

  const reportMutation = useMutation({
    mutationFn: async (data: {
      winnerId: string;
      winnerZone: string;
      winnerHero?: string;
      loserId: string;
      loserZone: string;
      loserHero?: string;
      proofImage?: string
    }) => {
      await apiRequest("POST", "/api/matches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "⚔️ Desafio Registrado",
        description: `Sua vitória foi enviada para análise da guilda.`,
      });
      setIsReportOpen(false);
      setReportOpponentId(null);
      setProofFile(null);
      setWinnerHero("");
      setLoserHero("");
    },
    onError: () => {
      toast({
        title: "Erro no Reporte",
        description: "Não foi possível registrar o combate.",
        variant: "destructive",
      });
    }
  });

  const dailyClaimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/daily-claim");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "✨ Honra Resgatada",
        description: data.message,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Ainda não, combatente!",
        description: "Você já resgatou sua recompensa hoje.",
        variant: "destructive",
      });
    }
  });

  const isDailyClaimed = () => {
    if (!myPlayer?.lastClaimedAt) return false;
    const lastClaimed = new Date(myPlayer.lastClaimedAt);
    const now = new Date();
    return lastClaimed.getDate() === now.getDate() &&
      lastClaimed.getMonth() === now.getMonth() &&
      lastClaimed.getFullYear() === now.getFullYear();
  };

  const handleReportWin = async () => {
    if (!reportOpponentId || !user) return;
    const loser = players?.find(p => p.id === reportOpponentId);
    if (!loser) return;

    let proofUrl = "";
    if (proofFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", proofFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        proofUrl = data.url;
      } catch (err) {
        toast({
          title: "Erro no Upload",
          description: "Não foi possível enviar a imagem de prova.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    reportMutation.mutate({
      winnerId: user.id,
      winnerZone: user.zoneId,
      winnerHero: winnerHero,
      loserId: loser.accountId,
      loserZone: loser.zoneId,
      loserHero: loserHero,
      proofImage: proofUrl
    });
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "from-yellow-400 via-amber-200 to-yellow-500 text-yellow-950 shadow-yellow-500/20";
    if (index === 1) return "from-slate-300 via-slate-100 to-slate-400 text-slate-900 shadow-slate-400/20";
    if (index === 2) return "from-orange-400 via-orange-200 to-orange-600 text-orange-950 shadow-orange-600/20";
    return "from-blue-500/10 to-blue-600/5 text-blue-100 border-white/5";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const sortedPlayers = players
    ? [...players]
      .filter(p => !p.isBanned)
      .filter(p =>
        p.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.accountId.includes(searchQuery)
      )
      .sort((a, b) => b.points - a.points)
    : [];

  const getRankGlow = (index: number) => {
    if (index === 0) return "rank-glow-grand-master";
    if (index === 1) return "rank-glow-master";
    if (index === 2) return "rank-glow-elite";
    return "";
  };

  const getMagicClass = (player: PlayerWithRewards) => {
    if (!player.rewards) return "";
    if (player.rewards.some(r => r.rarity === 'mythic')) return "magic-text-mythic";
    if (player.rewards.some(r => r.rarity === 'legendary')) return "magic-text-legendary";
    if (player.rewards.some(r => r.rarity === 'epic')) return "magic-text-epic";
    return "";
  };

  const getTimeLeft = (endDate: string) => {
    const total = Date.parse(endDate) - Date.parse(new Date().toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} DIAS` : "FINALIZANDO";
  };
  const getRankRequirements = (rank: string) => {
    switch (rank) {
      case "Grande Mestre": return "2000+ PTS";
      case "Mestre": return "1000+ PTS";
      case "Elite": return "600+ PTS";
      case "Guerreiro": return "300+ PTS";
      case "Soldado": return "100+ PTS";
      default: return "0+ PTS";
    }
  };

  const myPlayer = sortedPlayers.find(p => p.accountId === user?.id);
  const myRank = myPlayer ? sortedPlayers.indexOf(myPlayer) + 1 : "-";

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 relative">
      {/* Glory Marquee: Latest Achievements */}
      <div className="w-full overflow-hidden bg-primary/5 border-y border-primary/10 py-2 backdrop-blur-sm relative z-20">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 items-center px-4"
        >
          {sortedPlayers.slice(0, 5).map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-primary font-black uppercase text-[10px] tracking-widest">
                {i === 0 ? "🏆 REI DA ARENA:" : `🔥 TOP ${i + 1}:`}
              </span>
              <span className="text-white font-serif uppercase tracking-widest text-xs">
                {p.gameName} — {p.points} PTS
              </span>
            </div>
          ))}
          {/* Duplicate for seamless scroll */}
          {sortedPlayers.slice(0, 5).map((p, i) => (
            <div key={`${p.id}-dup`} className="flex items-center gap-2">
              <span className="text-primary font-black uppercase text-[10px] tracking-widest">
                {i === 0 ? "🏆 REI DA ARENA:" : `🔥 TOP ${i + 1}:`}
              </span>
              <span className="text-white font-serif uppercase tracking-widest text-xs">
                {p.gameName} — {p.points} PTS
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Immersive Arena Background */}
      <div
        className="fixed inset-0 z-[-1] opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url("/images/arena-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(0.5) contrast(1.2)'
        }}
      />

      {/* Top Gradient Fade */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#020617] via-transparent to-[#020617] pointer-events-none" />

      {/* Top 3 Podium Section */}
      <section className="relative py-12 px-4 mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl pointer-events-none" />
        {/* --- CINEMATIC SEASON BANNER --- */}
        {/* --- REFINED CINEMATIC SEASON BANNER --- */}
        {season && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 relative"
          >
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-4 bg-primary/5 blur-[80px] rounded-full opacity-50 pointer-events-none" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#020617]/60 backdrop-blur-3xl p-8 md:p-12">
              {/* Subtle Scanning Line Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-sans">Arena Ativa</span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground/60">
                    <div className="w-px h-4 bg-white/10" />
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">Encerramento:</span>
                    <span className="text-white font-mono text-sm tracking-widest">{getTimeLeft(season.endsAt).toLowerCase()}</span>
                  </div>
                </div>

                {/* Season Title with Elegant Glitch */}
                <div className="space-y-4 max-w-4xl relative">
                  <h2 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-white leading-tight">
                    {season.name.split(':')[0]}
                    {season.name.includes(':') && (
                      <span className="text-lg md:text-xl text-primary font-black italic tracking-[0.4em] uppercase mt-2 block opacity-80">
                        {season.name.split(':')[1]}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Prize Relics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                  {season.prizes.map((p, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative overflow-hidden p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md group/prize transition-all text-left"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/prize:opacity-20 transition-opacity">
                        <Award className="w-10 h-10 text-primary" />
                      </div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2 block font-sans">{p.rank}</span>
                      <p className="text-xs text-white/80 font-bold uppercase tracking-widest leading-relaxed leading-snug">{p.prize}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Arena Stats Hook */}
                <div className="flex items-center gap-12 pt-4 border-t border-white/5 w-full justify-center">
                  <div className="text-center group/stat">
                    <span className="block text-2xl font-serif font-black text-white group-hover/stat:text-primary transition-colors">{sortedPlayers.length}</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] font-sans">Guerreiros Ativos</span>
                  </div>
                  <div className="text-center group/stat">
                    <span className="block text-2xl font-serif font-black text-white group-hover/stat:text-primary transition-colors">
                      {players?.reduce((acc, p) => acc + p.wins, 0) || 0}
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] font-sans">Combates Travados</span>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 rounded-br-2xl" />
            </div>
          </motion.div>
        )}

        <div className="text-center mb-16 relative z-10">
          <Badge variant="outline" className="border-primary/40 text-primary mb-4 tracking-[0.3em] uppercase px-6 py-1 bg-primary/5">Elite do Clã</Badge>
          <h2 className="text-5xl font-serif font-black uppercase tracking-tighter text-glow">Titãs da Arena</h2>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 max-w-4xl mx-auto relative z-10">
          {/* Order for Podium: [2, 1, 3] */}
          {(sortedPlayers.slice(0, 3).length >= 3 || sortedPlayers.slice(0, 3).length > 0) && (
            <>
              {/* 2nd Place */}
              {sortedPlayers[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="w-full md:w-1/3 order-2 md:order-1"
                >
                  <Link href={`/player/${sortedPlayers[1].accountId}/${sortedPlayers[1].zoneId}`} className="block">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 overflow-hidden shadow-2xl relative z-10 mx-auto transition-all duration-500 ${getRankGlow(1)}`}>
                        <img src={sortedPlayers[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sortedPlayers[1].accountId}`} className="w-full h-full object-cover" alt={sortedPlayers[1].gameName} />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 font-black px-4 py-1 rounded-full text-sm z-20">2º</div>
                    </div>
                    <h3 className={`text-xl text-center group-hover:scale-110 transition-transform ${getMagicClass(sortedPlayers[1])}`}>
                      {sortedPlayers[1].gameName}
                    </h3>
                    <p className="text-slate-400 text-center font-bold">{sortedPlayers[1].points} pts</p>
                    <Badge className="mt-2 mx-auto block w-fit bg-slate-400 text-slate-950">PRATA</Badge>
                  </Link>
                </motion.div>
              )}

              {/* 1st Place */}
              {sortedPlayers[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8 }}
                  className="w-full md:w-[40%] order-1 md:order-2 z-20"
                >
                  <Link href={`/player/${sortedPlayers[0].accountId}/${sortedPlayers[0].zoneId}`} className="block">
                    <div className="relative mb-8">
                      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-12 left-1/2 -translate-x-1/2 text-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                        <Crown className="w-16 h-16 fill-primary" />
                      </motion.div>
                      <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full border-8 overflow-hidden relative z-10 mx-auto transition-all duration-700 ${getRankGlow(0)}`}>
                        <img src={sortedPlayers[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sortedPlayers[0].accountId}`} className="w-full h-full object-cover" alt={sortedPlayers[0].gameName} />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-black px-6 py-2 rounded-full text-xl z-20 shadow-xl">1º</div>
                    </div>
                    <h3 className={`text-3xl text-center group-hover:scale-110 transition-transform ${getMagicClass(sortedPlayers[0])}`}>
                      {sortedPlayers[0].gameName}
                    </h3>
                    <p className="text-primary text-center font-black text-2xl">{sortedPlayers[0].points} pts</p>
                    <Badge className="mt-2 mx-auto block w-fit bg-primary text-primary-foreground animate-pulse">GRANDE MESTRE</Badge>
                  </Link>
                </motion.div>
              )}

              {/* 3rd Place */}
              {sortedPlayers[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="w-full md:w-1/3 order-3"
                >
                  <Link href={`/player/${sortedPlayers[2].accountId}/${sortedPlayers[2].zoneId}`} className="block">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 overflow-hidden shadow-2xl relative z-10 mx-auto transition-all duration-500 ${getRankGlow(2)}`}>
                        <img src={sortedPlayers[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sortedPlayers[2].accountId}`} className="w-full h-full object-cover" alt={sortedPlayers[2].gameName} />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-800 text-white font-black px-4 py-1 rounded-full text-sm z-20">3º</div>
                    </div>
                    <h3 className={`text-xl text-center group-hover:scale-110 transition-transform ${getMagicClass(sortedPlayers[2])}`}>
                      {sortedPlayers[2].gameName}
                    </h3>
                    <p className="text-amber-700 text-center font-bold">{sortedPlayers[2].points} pts</p>
                    <Badge className="mt-2 mx-auto block w-fit bg-amber-800 text-white">BRONZE</Badge>
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
      {/* Hero Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Crown className="w-24 h-24 text-primary" />
            </div>
            <CardHeader className="pb-2 text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70">Sua Posição</p>
              <CardTitle className="text-4xl font-serif">#{myRank}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>{myPlayer ? "Ativo na Arena" : "Não Rankeado"}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Zap className="w-24 h-24 text-blue-400" />
            </div>
            <CardHeader className="pb-2 text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/70">Seus Pontos</p>
              <CardTitle className="text-4xl font-serif text-blue-100">{myPlayer?.points || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 font-bold">
                <span>Duelos Vencidos: {myPlayer?.wins || 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <Card className={`relative overflow-hidden group h-full border-none transition-all duration-500 ${isDailyClaimed() ? 'bg-white/5 opacity-80' : 'bg-gradient-to-br from-amber-500/30 via-primary/20 to-transparent border-primary/30 shadow-[0_0_30px_rgba(234,179,8,0.15)] shadow-primary/20'}`}>
            <div className="absolute inset-0 bg-grid-white/5 mask-gradient-to-b" />
            <CardHeader className="pb-2 text-center relative z-10">
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-primary/80">Recompensa Diária</p>
              <CardTitle className="text-2xl font-serif text-white uppercase italic">Honra Diária</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-3 relative z-10">
              <motion.div
                whileHover={!isDailyClaimed() ? { scale: 1.1, rotate: [0, 5, -5, 0] } : {}}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isDailyClaimed() ? 'bg-white/10' : 'bg-primary/20 border border-primary/30 shadow-lg shadow-primary/10'}`}
              >
                <Star className={`w-8 h-8 ${isDailyClaimed() ? 'text-muted-foreground' : 'text-primary fill-primary animate-pulse'}`} />
              </motion.div>

              <Button
                onClick={() => dailyClaimMutation.mutate()}
                disabled={isDailyClaimed() || dailyClaimMutation.isPending}
                className={`w-full h-10 uppercase text-[10px] font-black tracking-widest rounded-xl transition-all ${isDailyClaimed() ? 'bg-white/5 text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-white hover:text-primary shadow-xl shadow-primary/20'}`}
              >
                {isDailyClaimed() ? "RESGATADO" : "+15 PONTOS"}
              </Button>

              <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">
                {isDailyClaimed() ? "VOLTE EM 24 HORAS" : " DISPONÍVEL AGORA"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="h-full flex flex-col gap-4">
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-yellow-500 text-yellow-950 hover:bg-yellow-400 font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-yellow-500/20 group h-14">
                  <Swords className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Registrar Combate
                </Button>
              </DialogTrigger>
              <DialogContent className="border-primary/20 bg-[#020617]/95 backdrop-blur-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-3xl text-primary tracking-widest uppercase">Reportar Vitória</DialogTitle>
                  <DialogDescription className="text-muted-foreground tracking-wider">
                    O conselho da guilda validará sua conquista em breve.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70">Oponente Superado</Label>
                    <SearchableSelect
                      options={sortedPlayers
                        .filter(p => p.accountId !== user?.id)
                        .map(p => ({ label: p.gameName, value: p.id.toString() }))}
                      value={reportOpponentId?.toString()}
                      onChange={(val) => setReportOpponentId(parseInt(val))}
                      placeholder="ESCOLHER OPONENTE..."
                      emptyText="JOGADOR NÃO ENCONTRADO."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500/70">Seu Herói</Label>
                      <SearchableSelect
                        options={heroOptions}
                        value={winnerHero}
                        onChange={setWinnerHero}
                        placeholder="HERÓI..."
                        className="border-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70">Herói Inimigo</Label>
                      <SearchableSelect
                        options={heroOptions}
                        value={loserHero}
                        onChange={setLoserHero}
                        placeholder="HERÓI..."
                        className="border-red-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70">Prova da Vitória (Screenshot)</Label>
                    <div className="relative">
                      {!proofFile ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 bg-white/5 rounded-2xl p-6 transition-all hover:bg-white/10 group cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <ImageIcon className="w-8 h-8 text-primary/40 group-hover:scale-110 transition-transform mb-2" />
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Clique para anexar o print</p>
                        </div>
                      ) : (
                        <div className="relative rounded-2xl border border-primary/20 overflow-hidden group">
                          <img
                            src={URL.createObjectURL(proofFile)}
                            className="w-full h-32 object-cover opacity-60"
                            alt="Preview"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{proofFile.name}</span>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-6 h-6"
                            onClick={() => setProofFile(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleReportWin}
                    disabled={!reportOpponentId || isUploading || reportMutation.isPending}
                    className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> ENVIANDO PROVA...</>
                    ) : (
                      "Confirmar Destino do Oponente"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link href="/rewards">
              <Button variant="outline" className="w-full h-14 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase tracking-widest group">
                <Gift className="w-5 h-5 mr-3 group-hover:bounce" />
                Santuário de Prêmios
              </Button>
            </Link>

            <Link href="/arena">
              <Button variant="outline" className="w-full h-14 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-500 font-bold uppercase tracking-widest group">
                <Swords className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                War Room
              </Button>
            </Link>

            <Link href="/meta">
              <Button variant="outline" className="w-full h-14 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-bold uppercase tracking-widest group">
                <BarChart3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Meta da Guilda
              </Button>
            </Link>

            <Link href="/fame">
              <Button variant="outline" className="w-full h-14 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-widest group">
                <Trophy className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Mural da Glória
              </Button>
            </Link>
          </div>

        </motion.div>
      </section>

      {/* Leaderboard & Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-4 gap-4">
            <h3 className="text-xl font-serif tracking-[0.3em] uppercase flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              Líderes da Guilda
            </h3>

            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="BUSCAR GUERREIRO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-[10px] uppercase font-bold tracking-widest h-10 rounded-xl focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[9px] px-3 hidden sm:flex">
              Temporada de Sangue
            </Badge>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {sortedPlayers.length === 0 ? (
                <motion.div
                  key="empty-search"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-16 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/5"
                >
                  <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
                  <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs font-black">Nenhum guerreiro encontrado com "{searchQuery}"</p>
                  <Button
                    variant="link"
                    className="mt-4 text-primary uppercase text-[10px] font-bold tracking-widest"
                    onClick={() => setSearchQuery("")}
                  >
                    Limpar Busca
                  </Button>
                </motion.div>
              ) : (
                sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative flex items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all duration-300 ${index < 3
                      ? `bg-gradient-to-r ${getRankStyle(index)} border-transparent`
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                  >
                    <Link href={`/player/${player.accountId}/${player.zoneId}`} className="flex items-center gap-3 sm:gap-8 cursor-pointer hover:scale-[1.02] transition-transform flex-1 min-w-0">
                      <span className={`text-2xl sm:text-4xl font-serif font-black italic w-6 sm:w-10 text-center ${index >= 3 ? "text-white/20" : ""}`}>
                        {index + 1}
                      </span>

                      <div className="relative">
                        <img
                          src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.accountId}&backgroundColor=b6e3f4`}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-white/10 shadow-lg object-cover bg-black/20"
                        />
                        {index === 0 && <Crown className="absolute -top-2 -right-2 w-4 h-4 text-yellow-500 animate-bounce" />}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`text-base sm:text-xl font-bold tracking-tight truncate pr-2 flex items-center gap-2 ${getMagicClass(player)}`}>
                          {player.gameName}
                          <div className="flex -space-x-1">
                            {player.rewards?.map((r, i) => (
                              <TooltipProvider key={i}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <img
                                      src={r.icon}
                                      className="w-4 h-4 object-contain animate-bounce hover:z-30 transition-all hover:scale-150"
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                      alt={r.name}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-950 border-white/5 text-[9px] uppercase font-bold tracking-widest text-primary p-2">
                                    {r.name}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </span>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-medium opacity-70 cursor-help border-b border-dotted border-white/20">
                                  {player.currentRank || player.rank}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black/90 border-white/10 p-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary">Requisito do Rank:</p>
                                <p className="text-white font-bold">{getRankRequirements(player.rank)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {player.streak >= 2 && (
                            <Badge className="h-4 px-1 bg-orange-500 text-[8px] animate-pulse border-none">
                              🔥 {player.streak}
                            </Badge>
                          )}
                          {player.rewards?.length ? (
                            <Trophy className="w-3 h-3 text-yellow-500/60" />
                          ) : null}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-10">
                      <div className="text-right min-w-[60px] sm:min-w-[100px]">
                        <p className="text-xl sm:text-3xl font-serif font-black">{player.points}</p>
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60 font-bold">PTS</p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Feed */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-8 pt-8 lg:pt-0">
          <ActivityFeed />
        </div>
      </section>
    </div>
  );
}

