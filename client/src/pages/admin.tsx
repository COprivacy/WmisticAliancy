import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ShieldCheck,
  Check,
  X,
  Gavel,
  Users,
  Info,
  Loader2,
  Swords,
  ExternalLink,
  Gift,
  Ban,
  Unlock,
  Edit2,
  LayoutDashboard,
  ArrowUpRight,
  History,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Match, Player, Reward } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MatchWithNames = Match & { winnerName: string; loserName: string };

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [editPointsId, setEditPointsId] = useState<number | null>(null);
  const [newPoints, setNewPoints] = useState<number>(100);

  const { data: pendingMatches, isLoading: loadingMatches } = useQuery<MatchWithNames[]>({
    queryKey: ["/api/matches"],
  });

  const { data: playersList } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: rewardsList } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

  const matchMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      await apiRequest("POST", `/api/matches/${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: variables.action === "approve" ? "Veredicto Emitido" : "Combate Invalidado",
        description: variables.action === "approve" ? "Vitória reconhecida e pontos atualizados." : "As evidências foram insuficientes.",
        variant: variables.action === "approve" ? "default" : "destructive",
      });
    }
  });

  const playerAdminMutation = useMutation({
    mutationFn: async ({ id, points, isBanned, pin }: { id: number; points?: number; isBanned?: boolean; pin?: string | null }) => {
      await apiRequest("PATCH", `/api/players/${id}/admin`, { points, isBanned, pin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Soberania Aplicada", description: "O destino do jogador foi alterado com sucesso." });
      setEditPointsId(null);
    }
  });

  const assignRewardMutation = useMutation({
    mutationFn: async ({ playerId, rewardId }: { playerId: number; rewardId: number }) => {
      await apiRequest("POST", `/api/players/${playerId}/rewards`, { rewardId });
    },
    onSuccess: () => {
      toast({ title: "Relíquia Concedida!", description: "O item agora brilha na vitrine." });
      setSelectedRewardId(null);
    }
  });

  if (user && !user.isAdmin) {
    setLocation("/rankings");
    return null;
  }

  const filteredPlayers = playersList?.filter(p =>
    p.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.accountId.includes(searchQuery)
  );

  const stats = {
    totalPlayers: playersList?.length || 0,
    totalMatches: playersList?.reduce((acc, p) => acc + p.wins + p.losses, 0) || 0,
    pendingReports: pendingMatches?.length || 0,
    bannedPlayers: playersList?.filter(p => p.isBanned).length || 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 relative">
      <div className="relative p-12 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Gavel className="w-64 h-64" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center space-y-4">
          <Badge className="bg-primary text-primary-foreground uppercase tracking-widest px-4 py-1">Controle Supremo</Badge>
          <h2 className="text-5xl font-serif tracking-[0.3em] uppercase text-glow">Governança WMythic</h2>
          <p className="text-muted-foreground max-w-lg mx-auto tracking-widest text-xs font-black uppercase opacity-60">
            Painel administrativo para gestão de conflitos, membros e economia da guilda
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="bg-white/5 border border-white/5 h-16 p-2 rounded-2xl w-full max-w-2xl mx-auto grid grid-cols-3 gap-2">
          <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-[10px] font-black tracking-widest">
            <History className="w-3 h-3 mr-2" />
            Relatórios ({stats.pendingReports})
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-[10px] font-black tracking-widest">
            <Users className="w-3 h-3 mr-2" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase text-[10px] font-black tracking-widest">
            <LayoutDashboard className="w-3 h-3 mr-2" />
            Economia
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {!pendingMatches || pendingMatches.length === 0 ? (
                  <div className="p-20 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5">
                    <p className="text-muted-foreground uppercase tracking-widest text-xs italic">Nenhuma discórdia pendente na arena.</p>
                  </div>
                ) : (
                  pendingMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <span className="block text-xl font-black text-emerald-400 uppercase">{match.winnerName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">ID: {match.winnerId}</span>
                          </div>
                          <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-40">VS</div>
                          <div className="text-center">
                            <span className="block text-xl font-black text-rose-400 uppercase">{match.loserName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">ID: {match.loserId}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {match.proofImage && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="h-16 w-16 p-0 rounded-2xl border-white/10 overflow-hidden hover:border-primary/50 grayscale hover:grayscale-0 transition-all">
                                  <img src={match.proofImage} className="w-full h-full object-cover" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl bg-[#020617] border-white/10 p-2">
                                <img src={match.proofImage} className="w-full rounded-xl" />
                              </DialogContent>
                            </Dialog>
                          )}

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white h-12 px-6 rounded-xl uppercase font-bold text-xs"
                              onClick={() => matchMutation.mutate({ id: match.id, action: "reject" })}
                              disabled={matchMutation.isPending}
                            >
                              Invalidar
                            </Button>
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 rounded-xl uppercase font-black text-xs shadow-lg shadow-emerald-600/20"
                              onClick={() => matchMutation.mutate({ id: match.id, action: "approve" })}
                              disabled={matchMutation.isPending}
                            >
                              Confirmar Vitória
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white/5 border-white/10 rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="uppercase tracking-widest text-sm">Lista de Combatentes</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Gestão direta de pontuação e acesso</CardDescription>
                </div>
                <Input
                  placeholder="BUSCAR NOME OU ID..."
                  className="max-w-xs bg-black/20 border-white/5 text-[10px] uppercase font-bold tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPlayers?.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={player.avatar || ""} className={`w-12 h-12 rounded-xl object-cover ${player.isBanned ? 'grayscale opacity-30' : ''}`} />
                          {player.isBanned && <Ban className="absolute inset-0 m-auto text-rose-500 w-6 h-6" />}
                        </div>
                        <div>
                          <span className={`block font-black uppercase text-sm ${player.isBanned ? 'text-rose-500 line-through' : ''}`}>{player.gameName}</span>
                          <div className="flex items-center gap-2 text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                            <span>{player.rank}</span>
                            <span>•</span>
                            <span className="text-primary">{player.points} PTS</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 rounded-lg border-white/10"
                          onClick={() => {
                            setEditPointsId(player.id);
                            setNewPoints(player.points);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 w-8 p-0 rounded-lg border-white/10 ${player.isBanned ? 'text-emerald-500' : 'text-rose-500'}`}
                          onClick={() => playerAdminMutation.mutate({ id: player.id, isBanned: !player.isBanned })}
                        >
                          {player.isBanned ? <Unlock className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Resetar PIN"
                          className="h-8 w-8 p-0 rounded-lg border-white/10 text-amber-500"
                          onClick={() => {
                            if (confirm(`Deseja resetar o PIN de ${player.gameName}? O jogador terá que definir um novo no próximo login.`)) {
                              playerAdminMutation.mutate({ id: player.id, pin: null as any });
                            }
                          }}
                        >
                          <KeyRound className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "MEMBROS", value: stats.totalPlayers, icon: Users, color: "text-blue-500", desc: "Combatentes registrados" },
                { label: "COMBATES", value: stats.totalMatches, icon: Swords, color: "text-emerald-500", desc: "Total de lutas aprovadas" },
                { label: "PISCINA DE PTS", value: playersList?.reduce((acc, p) => acc + p.points, 0) || 0, icon: ShieldCheck, color: "text-primary", desc: "Economia total circulante" },
                { label: "BANIMENTOS", value: stats.bannedPlayers, icon: Ban, color: "text-rose-500", desc: "Contas suspensas" }
              ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8 space-y-2">
                    <div className={`p-3 rounded-2xl w-fit ${stat.color} bg-white/5`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-glow">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</div>
                    <p className="text-[8px] uppercase tracking-tighter opacity-40">{stat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Season Management Card */}
            <Card className="bg-rose-500/5 border-rose-500/20 rounded-[2rem] overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-500">
                    <History className="w-5 h-5" />
                  </div>
                  <CardTitle className="uppercase tracking-widest font-serif text-lg text-rose-500">Controle de Ciclo</CardTitle>
                </div>
                <CardDescription className="uppercase text-[10px] font-black opacity-60">Operações críticas de final de temporada</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between p-8">
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-widest text-white">Reset de Temporada</h4>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground max-w-md">
                    Isso zerará os pontos (para 100), vitórias, derrotas e streaks de todos os jogadores.
                    Use apenas quando a nova temporada for declarada.
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="h-14 px-10 rounded-2xl border-rose-500/40 hover:bg-rose-600 font-black uppercase tracking-widest shadow-xl shadow-rose-900/40">
                      REINICIAR TUDO ⚠️
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#020617] border-rose-500/30">
                    <DialogHeader>
                      <DialogTitle className="uppercase tracking-widest font-serif text-rose-500">CONFIRME O EXTERMÍNIO DE DADOS</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 text-center space-y-4">
                      <p className="text-sm uppercase font-bold text-muted-foreground leading-loose">
                        Você está prestes a apagar o progresso de <span className="text-white">{stats.totalPlayers}</span> guerreiros.
                        Esta ação <span className="text-rose-500">NÃO PODE SER DESFEITA</span>.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        className="w-full h-14 font-black uppercase tracking-widest"
                        onClick={() => {
                          apiRequest("POST", "/api/admin/reset-season")
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ["/api/players"] });
                              toast({ title: "Nova Era Iniciada", description: "Todos os combatentes voltaram ao estágio de Recruta." });
                            });
                        }}
                      >
                        EU ASSUMO O RISCO, RESETAR AGORA
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
            {/* Reward Distribution Re-implementation */}
            <Card className="bg-yellow-500/5 border-yellow-500/20 rounded-[2.5rem] overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-yellow-500/20 text-yellow-500">
                    <Gift className="w-6 h-6" />
                  </div>
                  <CardTitle className="uppercase tracking-widest font-serif text-xl text-yellow-500">Tesouro da Guilda</CardTitle>
                </div>
                <CardDescription className="uppercase text-[10px] font-black opacity-60 tracking-widest">Conceder relíquias sagradas aos guerreiros</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                <Select value={selectedPlayerId?.toString()} onValueChange={(val) => setSelectedPlayerId(parseInt(val))}>
                  <SelectTrigger className="flex-1 h-14 bg-black/20 border-white/10 rounded-2xl">
                    <SelectValue placeholder="QUEM RECEBERÁ?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {playersList?.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()} className="uppercase text-[10px] font-black">{p.gameName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRewardId?.toString()} onValueChange={(val) => setSelectedRewardId(parseInt(val))}>
                  <SelectTrigger className="flex-1 h-14 bg-black/20 border-white/10 rounded-2xl text-yellow-500">
                    <SelectValue placeholder="QUAL É A RELÍQUIA?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {rewardsList?.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()} className="uppercase text-[10px] font-black">
                        {r.name} ({r.rarity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="h-14 px-12 bg-yellow-500 text-yellow-950 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-yellow-400 shadow-xl shadow-yellow-500/20"
                  onClick={() => selectedPlayerId && selectedRewardId && assignRewardMutation.mutate({ playerId: selectedPlayerId, rewardId: selectedRewardId })}
                  disabled={!selectedPlayerId || !selectedRewardId || assignRewardMutation.isPending}
                >
                  ENTREGAR ✨
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Point Edit Dialog */}
      <Dialog open={!!editPointsId} onOpenChange={(open) => !open && setEditPointsId(null)}>
        <DialogContent className="bg-[#020617] border-white/10 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-[0.2em] font-serif text-primary">Alterar Pontuacão</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black tracking-widest opacity-60">Nova Pontuação Sugerida</Label>
              <Input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(parseInt(e.target.value))}
                className="h-14 bg-white/5 border-white/10 text-2xl font-black text-center"
              />
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[9px] uppercase font-bold tracking-wider text-primary/80 leading-relaxed">
                Alterar os pontos mudará automaticamente o Rank do jogador (Ex: Recruta para Elite). Use com sabedoria, mestre.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
              onClick={() => editPointsId && playerAdminMutation.mutate({ id: editPointsId, points: newPoints })}
              disabled={playerAdminMutation.isPending}
            >
              APLICAR MUDANÇA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

