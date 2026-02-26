import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Swords, Crown, Target, Zap, TrendingUp, ChevronRight, Loader2, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Player, Reward } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const { data: players, isLoading } = useQuery<PlayerWithRewards[]>({
    queryKey: ["/api/players"],
  });

  const { data: season } = useQuery<SeasonInfo>({
    queryKey: ["/api/season"],
  });

  const reportMutation = useMutation({
    mutationFn: async (data: { winnerId: string; winnerZone: string; loserId: string; loserZone: string, proofImage?: string }) => {
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
    },
    onError: () => {
      toast({
        title: "Erro no Reporte",
        description: "Não foi possível registrar o combate.",
        variant: "destructive",
      });
    }
  });

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
      loserId: loser.accountId,
      loserZone: loser.zoneId,
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

  const sortedPlayers = players ? [...players].sort((a, b) => b.points - a.points) : [];

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
  const myPlayer = sortedPlayers.find(p => p.accountId === user?.id);
  const myRank = myPlayer ? sortedPlayers.indexOf(myPlayer) + 1 : "-";

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 relative">
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
        {/* --- SEASON BANNER --- */}
        {season && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-[#020617]/60 backdrop-blur-3xl p-8"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.2em] px-4 py-1">
                  Temporada Ativa
                </Badge>
                <h2 className="text-2xl md:text-3xl font-serif text-white uppercase tracking-widest">{season.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  {season.prizes.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <span className="text-primary font-black uppercase">{p.rank}:</span>
                      <span className="text-muted-foreground italic">{p.prize}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-3xl border border-primary/20 min-w-[200px]">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Termina em:</span>
                <div className="text-4xl font-serif font-black text-white italic animate-pulse">
                  {getTimeLeft(season.endsAt)}
                </div>
              </div>
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
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-400 overflow-hidden shadow-2xl relative z-10 mx-auto">
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
                      <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-8 border-primary overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)] relative z-10 mx-auto">
                        <img src={sortedPlayers[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sortedPlayers[0].accountId}`} className="w-full h-full object-cover" alt={sortedPlayers[0].gameName} />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-black px-6 py-2 rounded-full text-xl z-20 shadow-xl">1º</div>
                    </div>
                    <h3 className={`text-3xl text-center group-hover:scale-110 transition-transform ${getMagicClass(sortedPlayers[0])}`}>
                      {sortedPlayers[0].gameName}
                    </h3>
                    <p className="text-primary text-center font-black text-2xl">{sortedPlayers[0].points} pts</p>
                    <Badge className="mt-2 mx-auto block w-fit bg-primary text-primary-foreground animate-pulse">GRÃO MESTRE</Badge>
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
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-800 overflow-hidden shadow-2xl relative z-10 mx-auto">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Crown className="w-24 h-24 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70">Sua Posição</p>
              <CardTitle className="text-4xl font-serif">#{myRank}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-primary font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>{myPlayer ? "Ativo na Arena" : "Não Rankeado"}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Zap className="w-24 h-24 text-blue-400" />
            </div>
            <CardHeader className="pb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/70">Seus Pontos</p>
              <CardTitle className="text-4xl font-serif text-blue-100">{myPlayer?.points || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <span>Duelos Vencidos: {myPlayer?.wins || 0}</span>
              </div>
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
                    <Select value={reportOpponentId?.toString()} onValueChange={(val) => setReportOpponentId(parseInt(val))}>
                      <SelectTrigger className="border-primary/20 bg-white/5 h-14">
                        <SelectValue placeholder="Selecione o perdedor..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-primary/20">
                        {sortedPlayers.filter(p => p.accountId !== user?.id).map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()} className="focus:bg-primary/20">
                            {player.gameName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </div>
        </motion.div>
      </section>

      {/* Leaderboard Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-xl font-serif tracking-[0.3em] uppercase flex items-center gap-3">
            <Trophy className="w-5 h-5 text-primary" />
            Líderes da Guilda
          </h3>
          <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[9px] px-3">
            Temporada de Sangue
          </Badge>
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => (
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
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-medium opacity-70">
                        {player.currentRank || player.rank}
                      </span>
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
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

