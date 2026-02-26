import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Swords, Crown, Target, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_PLAYERS = [
  { id: "1792001576", username: "Guerreiro Secreto", points: 2500, wins: 45, losses: 5, rank: "Mythical Glory", streak: 8 },
  { id: "10293847", username: "DarkSlayer", points: 2150, wins: 30, losses: 12, rank: "Mythic Honor", streak: 3 },
  { id: "56473829", username: "NinjaAssasin", points: 1980, wins: 25, losses: 15, rank: "Mythic", streak: -2 },
  { id: "11223344", username: "HealerPro", points: 1500, wins: 15, losses: 20, rank: "Legend", streak: 1 },
  { id: "99887766", username: "TankMaster", points: 1200, wins: 10, losses: 25, rank: "Epic", streak: -4 },
];

export default function Rankings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportOpponent, setReportOpponent] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleReportWin = () => {
    if (!reportOpponent) return;
    toast({
      title: "⚔️ Desafio Registrado",
      description: `Sua vitória foi enviada para análise da guilda.`,
    });
    setIsReportOpen(false);
    setReportOpponent("");
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "from-yellow-400 via-amber-200 to-yellow-500 text-yellow-950 shadow-yellow-500/20";
    if (index === 1) return "from-slate-300 via-slate-100 to-slate-400 text-slate-900 shadow-slate-400/20";
    if (index === 2) return "from-orange-400 via-orange-200 to-orange-600 text-orange-950 shadow-orange-600/20";
    return "from-blue-500/10 to-blue-600/5 text-blue-100 border-white/5";
  };

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
              <CardTitle className="text-4xl font-serif">#1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-primary font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Subindo no Rank</span>
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
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400/70">Pontos de Arena</p>
              <CardTitle className="text-4xl font-serif text-blue-100">2500</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <span>Duelos Vencidos: 45</span>
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
                      <Select value={reportOpponent} onValueChange={setReportOpponent}>
                        <SelectTrigger className="border-primary/20 bg-white/5 h-14">
                          <SelectValue placeholder="Selecione o perdedor..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-primary/20">
                          {MOCK_PLAYERS.map((player) => (
                            <SelectItem key={player.id} value={player.id} className="focus:bg-primary/20">
                              {player.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReportWin} disabled={!reportOpponent} className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest">
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
            {MOCK_PLAYERS.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className={`group relative flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
                  index < 3 
                    ? `bg-gradient-to-r ${getRankStyle(index)} border-transparent` 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-8">
                  <span className={`text-4xl font-serif font-black italic w-10 text-center ${index >= 3 ? "text-white/20" : ""}`}>
                    {index + 1}
                  </span>
                  
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight flex items-center gap-3">
                      {player.username}
                      {index === 0 && <Crown className="w-5 h-5 animate-pulse" />}
                    </span>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-medium opacity-70`}>
                      {player.rank} • 🔥 {player.streak} Vitórias Seguidas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-bold mb-1">Win Rate</p>
                    <div className="flex items-center gap-2">
                       <div className="w-20 h-1 bg-black/10 rounded-full overflow-hidden">
                          <div className={`h-full ${index < 3 ? 'bg-current' : 'bg-primary'}`} style={{ width: '85%' }} />
                       </div>
                       <span className="text-xs font-bold">85%</span>
                    </div>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-3xl font-serif font-black">{player.points}</p>
                    <p className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-bold">PTS</p>
                  </div>
                  
                  <ChevronRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all ${index < 3 ? 'text-current' : 'text-primary'}`} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
