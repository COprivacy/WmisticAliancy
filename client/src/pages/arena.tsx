import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Calendar, Clock, MessageSquare, Loader2, Info, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlayerAvatar } from "@/components/player-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Challenge = {
    id: number;
    challengerId: string;
    challengerName: string;
    challengerAvatar?: string;
    challengedId: string;
    challengedName: string;
    challengedAvatar?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    message?: string;
    scheduledAt?: string;
    createdAt: string;
};

export default function ArenaPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: challenges, isLoading } = useQuery<Challenge[]>({
        queryKey: ["/api/challenges"],
    });

    const cancelMutation = useMutation({
        mutationFn: async (challengeId: number) => {
            const res = await apiRequest("PATCH", `/api/challenges/${challengeId}`, { status: 'cancelled' });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
            queryClient.invalidateQueries({ queryKey: ["/api/players"] }); // Atualizar tickets
            toast({ title: "Duelo cancelado", description: "O combate foi anulado e os Tickets da Arena foram devolvidos caso tenham sido gastos." });
        },
        onError: () => {
            toast({ title: "Erro", description: "Não foi possível cancelar o combate.", variant: "destructive" });
        }
    });

    const acceptedChallenges = challenges?.filter(c => {
        if (c.status !== 'accepted') return false;

        // Se o agendamento já passou em mais de 6 horas, consideramos o duelo expirado ou já realizado
        // Assim, eles somem da 'Arena Ao Vivo' sozinhos
        if (c.scheduledAt) {
            const scheduledDate = new Date(c.scheduledAt);
            const now = new Date();
            const sixHoursInMs = 6 * 60 * 60 * 1000;
            if (now.getTime() - scheduledDate.getTime() > sixHoursInMs) {
                return false;
            }
        }

        return true;
    }) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="uppercase tracking-[0.3em] font-black text-xs text-primary/60">Sincronizando Sala de Guerra...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-10 px-4 sm:px-6">
            <header className="text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Badge className="bg-orange-600 text-white border-orange-500/30 px-6 py-2 uppercase tracking-[0.4em] font-black text-xs shadow-lg shadow-orange-500/20">
                        CENTRAL DE COMBATE
                    </Badge>
                </motion.div>
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-4">
                        <h1 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-widest text-glow leading-none">Sala de Guerra</h1>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 text-primary transition-colors">
                                    <Info className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-slate-900/95 backdrop-blur-xl border-primary/20 text-[10px] text-muted-foreground uppercase tracking-[0.15em] leading-loose p-6 shadow-2xl z-50">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                                        <Swords className="w-4 h-4 text-primary" />
                                        <h4 className="font-black text-primary">Como participar?</h4>
                                    </div>
                                    <p>Esta sala exibe os duelos oficialmente marcados e aceitos na aliança.</p>
                                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                        <p className="text-white font-bold mb-1">Passo a Passo:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Vá ao Ranking</li>
                                            <li>Acesse o perfil de um rival</li>
                                            <li>Clique em <span className="text-orange-500 font-black">Lançar Desafio</span></li>
                                            <li>Aguarde ele aceitar!</li>
                                        </ol>
                                    </div>
                                    <p className="text-[8px] italic opacity-50">Duelos aceitos aparecem aqui automaticamente.</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                </div>
                <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold opacity-60">Prepare seu coração: os duelos mais esperados do clã acontecem aqui.</p>
            </header>

            <section className="space-y-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <Swords className="w-6 h-6 text-primary animate-pulse" />
                        <h2 className="text-2xl font-serif uppercase tracking-widest">Arena Ao Vivo</h2>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 uppercase tracking-widest text-[11px] font-bold">
                        {acceptedChallenges.length} DUELOS AGENDADOS
                    </Badge>
                </div>

                <div className="grid gap-8">
                    {acceptedChallenges.length === 0 ? (
                        <Card className="bg-[#020617]/40 border-dashed border-white/10 p-20 text-center rounded-3xl">
                            <Swords className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
                            <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs font-bold">O silêncio precede a tempestade...</p>
                            <p className="text-muted-foreground/40 uppercase tracking-widest text-[10px] mt-2">Nenhum duelo confirmado para as próximas horas.</p>
                        </Card>
                    ) : (
                        acceptedChallenges.map((challenge, i) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="bg-[#020617]/60 border-primary/20 backdrop-blur-3xl overflow-hidden relative group rounded-3xl shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row items-center relative z-10">
                                            {/* Challenger */}
                                            <div className="flex-1 p-10 text-center space-y-6">
                                                <div className="relative inline-block">
                                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <PlayerAvatar
                                                        player={{
                                                            accountId: challenge.challengerId,
                                                            zoneId: challenge.challengerId, // Zone ID might be missing in challenge type, defaulting
                                                            gameName: challenge.challengerName,
                                                            avatar: challenge.challengerAvatar,
                                                            activeFrame: (challenge as any).challengerFrame || null, // Assuming we might add this or it's enough
                                                            isBanned: false,
                                                            streak: 0
                                                        } as any}
                                                        size="xl"
                                                    />
                                                    <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white uppercase text-[10px] font-black px-4 py-1.5 shadow-lg border-none z-20">DESAFIANTE</Badge>
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-glow">{challenge.challengerName}</h3>
                                            </div>

                                            {/* VS Decorator */}
                                            <div className="flex items-center justify-center p-4 relative py-8 md:py-0">
                                                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                                    <span className="text-3xl font-serif italic text-primary font-black">VS</span>
                                                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
                                                </div>
                                                {/* Connecting lines for desktop */}
                                                <div className="hidden md:block absolute left-full right-full h-px bg-gradient-to-r from-primary/30 to-transparent w-24" />
                                                <div className="hidden md:block absolute right-full left-full h-px bg-gradient-to-l from-primary/30 to-transparent w-24" />
                                            </div>

                                            {/* Challenged */}
                                            <div className="flex-1 p-10 text-center space-y-6">
                                                <div className="relative inline-block">
                                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <PlayerAvatar
                                                        player={{
                                                            accountId: challenge.challengedId,
                                                            zoneId: challenge.challengedId,
                                                            gameName: challenge.challengedName,
                                                            avatar: challenge.challengedAvatar,
                                                            activeFrame: (challenge as any).challengedFrame || null,
                                                            isBanned: false,
                                                            streak: 0
                                                        } as any}
                                                        size="xl"
                                                    />
                                                    <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white uppercase text-[10px] font-black px-4 py-1.5 shadow-lg border-none z-20">DEFENSOR</Badge>
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-glow">{challenge.challengedName}</h3>
                                            </div>
                                        </div>

                                        {/* Duel Info Footer */}
                                        <div className="bg-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5">
                                            <div className="flex items-center gap-12">
                                                <div className="flex flex-col items-center md:items-start gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                        <span className="text-xs uppercase font-black tracking-[0.2em] text-primary">DATA DO COMBATE</span>
                                                    </div>
                                                    <span className="text-sm font-bold uppercase tracking-widest pl-6">
                                                        {challenge.scheduledAt ? format(new Date(challenge.scheduledAt), "dd 'de' MMMM", { locale: ptBR }) : "INDETERMINADA"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center md:items-start gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        <span className="text-xs uppercase font-black tracking-[0.2em] text-primary">HORÁRIO MARCADO</span>
                                                    </div>
                                                    <span className="text-sm font-bold uppercase tracking-widest pl-6">
                                                        {challenge.scheduledAt ? format(new Date(challenge.scheduledAt), "HH:mm 'BRT'", { locale: ptBR }) : "A DEFINIR"}
                                                    </span>
                                                </div>
                                            </div>

                                            {challenge.message && (
                                                <div className="flex-1 max-w-lg bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 flex items-start gap-4 shadow-inner">
                                                    <div className="p-2 rounded-lg bg-orange-500/10 mt-1">
                                                        <MessageSquare className="w-4 h-4 text-orange-500" />
                                                    </div>
                                                    <p className="text-xs italic text-orange-200/60 leading-relaxed font-medium">"{challenge.message}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {user && (user.id === challenge.challengerId || user.id === challenge.challengedId) && (
                                            <div className="absolute top-4 right-4 z-50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500/60 transition-colors"
                                                    onClick={() => {
                                                        if (confirm("Você quer realmente cancelar este duelo? Os Ingressos de Arena serão devolvidos.")) {
                                                            cancelMutation.mutate(challenge.id);
                                                        }
                                                    }}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
