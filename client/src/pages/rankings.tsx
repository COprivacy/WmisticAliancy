import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Swords, Crown, Target, Zap, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Player } from "@shared/schema";

export default function Rankings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportOpponentId, setReportOpponentId] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const reportMutation = useMutation({
    mutationFn: async (data: { winnerId: string; winnerZone: string; loserId: string; loserZone: string }) => {
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
    },
    onError: () => {
      toast({
        title: "Erro no Reporte",
        description: "Não foi possível registrar o combate.",
        variant: "destructive",
      });
    }
  });

  const handleReportWin = () => {
    if (!reportOpponentId || !user) return;
    const loser = players?.find(p => p.id === reportOpponentId);
    if (!loser) return;

    reportMutation.mutate({
      winnerId: user.id,
      winnerZone: user.zoneId,
      loserId: loser.accountId,
      loserZone: loser.zoneId
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

  const sortedPlayers = [...(players || [])].sort((a, b) => b.points - a.points);
  const myPlayer = sortedPlayers.find(p => p.accountId === user?.id);
  const myRank = myPlayer ? sortedPlayers.indexOf(myPlayer) + 1 : "-";

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
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
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-yellow-400 font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 group h-full">
                  <Swords className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
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
                </div>
                <DialogFooter>
                  <Button onClick={handleReportWin} disabled={!reportOpponentId} className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest">
                    Confirmar Destino
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    <span className="text-base sm:text-xl font-bold tracking-tight truncate pr-2">
                      {player.gameName}
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

