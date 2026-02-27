import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Crown, UserPlus, Zap, Star, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Reaction = {
    id: number;
    activityId: number;
    userId: string;
    emoji: string;
};

type Activity = {
    id: number;
    type: 'match_approved' | 'rank_up' | 'reward_earned' | 'new_player' | 'daily_claim';
    playerGameName: string;
    data: any;
    createdAt: string;
    reactions: Reaction[];
};

export default function ActivityFeed() {
    const { user } = useAuth();
    const { data: activities, isLoading } = useQuery<Activity[]>({
        queryKey: ["/api/activities"],
        refetchInterval: 10000,
    });

    const reactMutation = useMutation({
        mutationFn: async ({ activityId, emoji }: { activityId: number, emoji: string }) => {
            await apiRequest("POST", `/api/activities/${activityId}/react`, { emoji });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'match_approved': return <Swords className="w-4 h-4 text-emerald-400" />;
            case 'rank_up': return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'reward_earned': return <Star className="w-4 h-4 text-purple-400" />;
            case 'new_player': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'daily_claim': return <Star className="w-4 h-4 text-orange-400 animate-bounce" />;
            default: return <Zap className="w-4 h-4 text-primary" />;
        }
    };

    const getContent = (activity: Activity) => {
        const name = <span className="text-white font-bold">{activity.playerGameName}</span>;

        switch (activity.type) {
            case 'match_approved':
                return (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {name} venceu um combate contra <span className="text-white">{activity.data?.opponentName}</span>!
                            {activity.data?.winnerHero && <span className="block mt-1 text-[10px] text-emerald-400/70 border-l border-emerald-500/20 pl-2">DOMINOU COM: {activity.data.winnerHero}</span>}
                        </p>
                        {activity.data?.proofImage && (
                            <div
                                className="rounded-lg overflow-hidden border border-white/5 bg-white/5 aspect-video relative group/img cursor-pointer"
                                onClick={() => window.open(activity.data.proofImage, '_blank')}
                            >
                                <img
                                    src={activity.data.proofImage}
                                    className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-all duration-500"
                                    alt="Ver Prova"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                                    <Swords className="w-5 h-5 text-white animate-pulse" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'rank_up':
                return (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {name} subiu de nível! Agora é <span className="text-yellow-500 font-black">{activity.data?.newRank}</span> 🚀
                    </p>
                );
            case 'reward_earned':
                return (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {name} conquistou uma relíquia: <span className="text-purple-400 font-bold">{activity.data?.rewardName}</span> ✨
                    </p>
                );
            case 'new_player':
                return (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {name} acaba de entrar na arena! Seja bem-vindo combatente ⚔️
                    </p>
                );
            case 'daily_claim':
                return (
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {name} resgatou sua honra diária (+{activity.data?.points} pts)! ✨
                    </p>
                );
            default:
                return <p className="text-xs text-muted-foreground uppercase tracking-wider">{name} realizou uma nova atividade.</p>;
        }
    };

    if (isLoading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-xl border border-white/5" />
            ))}
        </div>
    );

    const availableEmojis = ["🔥", "👏", "🏆", "❤️", "⚡"];

    return (
        <Card className="bg-[#020617]/40 border-white/5 backdrop-blur-xl overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary animate-pulse" />
                    Radar da Arena
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-6">
                    <AnimatePresence initial={false}>
                        {activities?.map((activity, i) => {
                            // Group reactions by emoji
                            const groupedReactions = activity.reactions?.reduce((acc, curr) => {
                                acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative pl-6 pb-2 border-l border-white/5 last:pb-0"
                                >
                                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center">
                                        {getIcon(activity.type)}
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            {getContent(activity)}
                                            <span className="text-[8px] text-muted-foreground lowercase font-mono">
                                                {(() => {
                                                    const date = new Date(activity.createdAt);
                                                    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                                                        return "recentemente";
                                                    }
                                                    return `há ${formatDistanceToNow(date, { locale: ptBR })}`;
                                                })()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {/* Existing Reactions */}
                                            {Object.entries(groupedReactions || {}).map(([emoji, count]) => {
                                                const hasReacted = activity.reactions?.some(r => r.userId === user?.id && r.emoji === emoji);
                                                return (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => reactMutation.mutate({ activityId: activity.id, emoji })}
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] border transition-all",
                                                            hasReacted
                                                                ? "bg-primary/20 border-primary/40 text-primary scale-110"
                                                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                                        )}
                                                    >
                                                        <span>{emoji}</span>
                                                        <span className="font-bold">{count}</span>
                                                    </button>
                                                );
                                            })}

                                            {/* Add Reaction Button (Mini) */}
                                            <div className="flex items-center gap-1 ml-1">
                                                {availableEmojis.map(emoji => {
                                                    const alreadyReacted = activity.reactions?.some(r => r.userId === user?.id && r.emoji === emoji);
                                                    if (alreadyReacted) return null;
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => reactMutation.mutate({ activityId: activity.id, emoji })}
                                                            className="opacity-20 hover:opacity-100 transition-opacity text-xs grayscale hover:grayscale-0"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {(!activities || activities.length === 0) && (
                        <div className="py-6 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">A arena está calma por enquanto...</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
