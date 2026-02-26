import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Check, X, Gavel, Users, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Match } from "@shared/schema";

type MatchWithNames = Match & { winnerName: string; loserName: string };

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: pendingMatches, isLoading } = useQuery<MatchWithNames[]>({
    queryKey: ["/api/matches"],
  });

  const verditMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      await apiRequest("POST", `/api/matches/${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: variables.action === "approve" ? "Veredicto Emitido" : "Combate Invalidado",
        description: variables.action === "approve"
          ? "Vitória reconhecida e pontos atualizados."
          : "As evidências foram insuficientes.",
        variant: variables.action === "approve" ? "default" : "destructive",
      });
    }
  });

  if (user && !user.isAdmin) {
    setLocation("/rankings");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      <div className="relative p-12 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Gavel className="w-64 h-64" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center space-y-4">
          <Badge className="bg-primary text-primary-foreground uppercase tracking-widest px-4 py-1">Painel de Julgamento</Badge>
          <h2 className="text-5xl font-serif tracking-[0.3em] uppercase text-glow">Governança da Guilda</h2>
          <p className="text-muted-foreground max-w-lg mx-auto tracking-widest text-sm font-medium uppercase">
            Soberania máxima sobre os resultados e integridade do Rank 1v1
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xl font-serif tracking-[0.2em] uppercase flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Relatórios Pendentes
            </h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!pendingMatches || pendingMatches.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                  <p className="text-muted-foreground uppercase tracking-widest text-xs">Paz na Arena. Nenhum conflito pendente.</p>
                </motion.div>
              ) : (
                pendingMatches.map((match) => (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="space-y-4 text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                        <div className="flex flex-col text-center md:text-left">
                          <span className="text-2xl font-black text-green-500 uppercase">{match.winnerName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">ID: {match.winnerId} ({match.winnerZone})</span>
                        </div>
                        <span className="text-muted-foreground text-sm font-serif italic py-2 md:py-0">vs</span>
                        <div className="flex flex-col text-center md:text-right">
                          <span className="text-2xl font-black text-red-500 uppercase">{match.loserName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">ID: {match.loserId} ({match.loserZone})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] uppercase px-3 py-1">
                          {new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Aguardando Avalição Administrativa</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                      <Button
                        variant="outline"
                        size="lg"
                        disabled={verditMutation.isPending}
                        className="rounded-full px-8 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        onClick={() => verditMutation.mutate({ id: match.id, action: "reject" })}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button
                        size="lg"
                        disabled={verditMutation.isPending}
                        className="rounded-full px-8 bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20"
                        onClick={() => verditMutation.mutate({ id: match.id, action: "approve" })}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Validar
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-serif tracking-widest uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Status da Guilda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground uppercase tracking-tighter text-[10px] font-bold">Membros Ativos</span>
                <span className="font-serif">Painel Admin</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-primary p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Info className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                    Os pontos são calculados com base no rank atual do oponente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

