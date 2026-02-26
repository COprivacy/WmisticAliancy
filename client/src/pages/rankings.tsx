import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Swords, Medal, History, Crown, Target } from "lucide-react";

// Mock Data
const MOCK_PLAYERS = [
  { id: "1792001576", username: "sempaigam", points: 2500, wins: 45, losses: 5, rank: "Mythical Glory", streak: 8 },
  { id: "10293847", username: "DarkSlayer", points: 2150, wins: 30, losses: 12, rank: "Mythic Honor", streak: 3 },
  { id: "56473829", username: "NinjaAssasin", points: 1980, wins: 25, losses: 15, rank: "Mythic", streak: -2 },
  { id: "11223344", username: "HealerPro", points: 1500, wins: 15, losses: 20, rank: "Legend", streak: 1 },
  { id: "99887766", username: "TankMaster", points: 1200, wins: 10, losses: 25, rank: "Epic", streak: -4 },
];

const MOCK_MATCHES = [
  { id: 1, winner: "sempaigam", loser: "DarkSlayer", date: "2 horas atrás", status: "approved" },
  { id: 2, winner: "NinjaAssasin", loser: "HealerPro", date: "5 horas atrás", status: "approved" },
  { id: 3, winner: "DarkSlayer", loser: "NinjaAssasin", date: "Ontem", status: "approved" },
];

export default function Rankings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportOpponent, setReportOpponent] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleReportWin = () => {
    if (!reportOpponent) return;
    
    toast({
      title: "Vitória reportada!",
      description: `Sua vitória contra ${MOCK_PLAYERS.find(p => p.id === reportOpponent)?.username} foi enviada para aprovação do administrador.`,
    });
    setIsReportOpen(false);
    setReportOpponent("");
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    if (index === 1) return "bg-gray-400/20 text-gray-400 border-gray-400/50";
    if (index === 2) return "bg-amber-700/20 text-amber-600 border-amber-700/50";
    return "bg-secondary text-secondary-foreground border-border";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 uppercase">
            Hall da Fama 1v1
          </h2>
          <p className="text-muted-foreground">Temporada 1: O Despertar do Mito</p>
        </div>
        
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 uppercase tracking-widest font-bold">
              <Swords className="w-4 h-4 mr-2" />
              Reportar Vitória
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-primary/20 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Reportar Resultado</DialogTitle>
              <DialogDescription>
                Selecione o membro do clã que você derrotou no duelo 1v1. O administrador irá verificar e aprovar o resultado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="opponent" className="text-primary/80 uppercase text-xs font-bold">Oponente Derrotado</Label>
                <Select value={reportOpponent} onValueChange={setReportOpponent}>
                  <SelectTrigger className="border-primary/20 bg-background/50 h-12">
                    <SelectValue placeholder="Selecione o jogador..." />
                  </SelectTrigger>
                  <SelectContent className="border-primary/20">
                    {MOCK_PLAYERS.filter(p => p.id !== user?.id).map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.username} ({player.rank})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleReportWin} disabled={!reportOpponent} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-bold uppercase tracking-wider">
                Enviar para Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-serif">
                <Crown className="w-5 h-5 mr-2 text-primary" />
                Classificação Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {MOCK_PLAYERS.sort((a, b) => b.points - a.points).map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`p-4 flex items-center justify-between transition-colors hover:bg-primary/5 ${user?.id === player.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center font-serif text-xl font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{player.username}</span>
                          {index < 3 && (
                            <Badge variant="outline" className={getRankBadgeColor(index)}>
                              Top {index + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{player.rank}</span>
                          <span>•</span>
                          <span className={player.streak > 0 ? 'text-green-500' : player.streak < 0 ? 'text-red-500' : ''}>
                            {player.streak > 0 ? `🔥 ${player.streak} Vitórias` : player.streak < 0 ? `🧊 ${Math.abs(player.streak)} Derrotas` : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-serif text-primary font-bold">{player.points}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-serif">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Seu Desempenho
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Pontuação</p>
                      <p className="text-4xl font-serif text-primary mt-1">
                        {MOCK_PLAYERS.find(p => p.id === user.id)?.points || 1000}
                      </p>
                    </div>
                    <Trophy className="w-12 h-12 text-primary/20" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Vitórias</p>
                      <p className="text-2xl font-bold text-green-500">
                        {MOCK_PLAYERS.find(p => p.id === user.id)?.wins || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Derrotas</p>
                      <p className="text-2xl font-bold text-red-500">
                        {MOCK_PLAYERS.find(p => p.id === user.id)?.losses || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Taxa de Vitória</p>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${(MOCK_PLAYERS.find(p => p.id === user.id)?.wins || 0) / ((MOCK_PLAYERS.find(p => p.id === user.id)?.wins || 0) + (MOCK_PLAYERS.find(p => p.id === user.id)?.losses || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-serif">
                <History className="w-5 h-5 mr-2 text-primary" />
                Últimos Duelos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_MATCHES.map((match) => (
                  <div key={match.id} className="flex flex-col gap-1 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-green-500">{match.winner}</span>
                      <span className="text-muted-foreground text-xs italic">vs</span>
                      <span className="font-bold text-red-500">{match.loser}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{match.date}</span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-primary/10 text-primary border-primary/20">
                        Aprovado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
