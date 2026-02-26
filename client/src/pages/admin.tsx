import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Check, X, ShieldCheck } from "lucide-react";

// Mock Data
const MOCK_PENDING_MATCHES = [
  { id: 101, winner: "DarkSlayer", loser: "TankMaster", date: "10 min atrás", imageProof: "screenshot1.jpg" },
  { id: 102, winner: "NinjaAssasin", loser: "HealerPro", date: "30 min atrás", imageProof: "screenshot2.jpg" },
];

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pendingMatches, setPendingMatches] = useState(MOCK_PENDING_MATCHES);

  // Redireciona se não for admin
  if (user && !user.isAdmin) {
    setLocation("/rankings");
    return null;
  }

  const handleApprove = (id: number, winner: string) => {
    setPendingMatches(pendingMatches.filter(m => m.id !== id));
    toast({
      title: "Resultado Aprovado",
      description: `A vitória de ${winner} foi computada no ranking.`,
      className: "border-green-500 bg-green-500/10 text-green-500",
    });
  };

  const handleReject = (id: number) => {
    setPendingMatches(pendingMatches.filter(m => m.id !== id));
    toast({
      title: "Resultado Rejeitado",
      description: "O resultado da partida foi invalidado.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
        <ShieldCheck className="w-10 h-10 text-primary" />
        <div>
          <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 uppercase">
            Painel do Administrador
          </h2>
          <p className="text-muted-foreground">Aprovação de resultados e gerenciamento do clã.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              Resultados Pendentes
              <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                {pendingMatches.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Analise e aprove os resultados de 1v1 reportados pelos membros do clã.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/30">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhum resultado pendente de aprovação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div key={match.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-primary/20 bg-background/50 gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-muted-foreground">{match.date}</span>
                        <Badge variant="outline" className="text-[10px] uppercase bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Aguardando Revisão
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-bold text-green-500">{match.winner}</span>
                        <span className="text-muted-foreground font-serif italic text-sm">derrotou</span>
                        <span className="font-bold text-red-500">{match.loser}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-500/50 hover:bg-red-500/20 hover:text-red-500 text-red-500/80"
                        onClick={() => handleReject(match.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-500 text-white"
                        onClick={() => handleApprove(match.id, match.winner)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 opacity-75">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Configurações da Temporada</CardTitle>
            <CardDescription>Esta funcionalidade estará disponível no sistema completo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled className="w-full sm:w-auto">
              Zerar Ranking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
