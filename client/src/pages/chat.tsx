import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send, MessageSquare, AlertCircle, Flame, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "@/components/player-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type GlobalMessage = {
    id: number;
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    authorFrame: string | null;
    authorRank: string;
    content: string;
    createdAt: string;
    authorZoneId?: string;
};

export default function Chat() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [prevMessageCount, setPrevMessageCount] = useState(0);
    const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);

    const { data: messages = [], isLoading, error } = useQuery<GlobalMessage[]>({
        queryKey: ["/api/chat/messages"],
        refetchInterval: 3000,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", "/api/chat/messages", { content });
            return await res.json();
        },
        onSuccess: (newMsg) => {
            queryClient.setQueryData(["/api/chat/messages"], (old: GlobalMessage[] | undefined) => {
                if (!old) return [newMsg];
                return [...old, newMsg];
            });
            setNewMessage("");
            scrollToBottom();
        },
        onError: (err: Error) => {
            toast({
                title: "Erro ao enviar",
                description: err.message || "Tente novamente mais tarde.",
                variant: "destructive"
            });
        }
    });

    const clearMessagesMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("DELETE", "/api/chat/messages");
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await res.json();
            }
            return { success: true }; // Fallback if server returned text but status was 2xx
        },
        onSuccess: async () => {
            // Primeiro invalidamos e limpamos localmente
            await queryClient.cancelQueries({ queryKey: ["/api/chat/messages"] });
            queryClient.setQueryData(["/api/chat/messages"], []);
            await queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });

            toast({
                title: "Arena Limpa",
                description: "Todas as mensagens foram removidas por ordem superior.",
            });
            // Opcional: recarregar do servidor imediatamente para garantir que está sincronizado
            queryClient.refetchQueries({ queryKey: ["/api/chat/messages"] });
        },
        onError: (err: Error) => {
            toast({
                title: "Erro ao limpar",
                description: err.message || "Não foi possível limpar o chat.",
                variant: "destructive"
            });
        }
    });

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior });
            setShowNewMessageBadge(false);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sendMessageMutation.isPending) return;
        sendMessageMutation.mutate(newMessage);
    };

    useEffect(() => {
        if (messages.length > prevMessageCount) {
            const lastMsg = messages[messages.length - 1];
            const isMe = lastMsg?.authorId === user?.id || (user?.isAdmin && lastMsg?.authorId === "admin");

            // Check if user is near bottom
            const container = scrollContainerRef.current;
            const isNearBottom = container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 100) : true;

            if (isMe || isNearBottom) {
                scrollToBottom(isMe ? "smooth" : "auto");
            } else {
                setShowNewMessageBadge(true);
            }
            setPrevMessageCount(messages.length);
        }
    }, [messages, prevMessageCount, user?.id, user?.isAdmin]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pt-4 relative"
        >
            {/* Background Magic Elements */}
            <div className="absolute inset-0 z-[-1] overflow-hidden rounded-3xl opacity-30 pointer-events-none mix-blend-screen"
                style={{
                    backgroundImage: `url('https://images2.alphacoders.com/835/thumb-1920-835474.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                }}
            />

            <div className="flex items-center justify-between mb-6 relative z-10 w-full px-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <MessageSquare className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-wider text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                            Chat Global
                        </h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                            Desafie outros guerreiros e compartilhe suas glórias.
                        </p>
                    </div>
                </div>

                {user?.isAdmin && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20">
                                {clearMessagesMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#020617] border-rose-500/30 backdrop-blur-xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="uppercase tracking-widest text-rose-500 font-black text-xl">Limpar Arena</AlertDialogTitle>
                                <AlertDialogDescription className="uppercase text-xs font-bold opacity-70 leading-relaxed">
                                    Deseja apagar todas as mensagens do chat global permanentemente? Esta ação expulsará os ecos do passado e não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                                <AlertDialogCancel className="bg-white/5 border-white/10 uppercase font-black text-[10px] tracking-widest hover:bg-white/10 h-12">Me perdi</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => clearMessagesMutation.mutate()}
                                    className="bg-rose-600 hover:bg-rose-700 uppercase font-black text-[10px] tracking-widest h-12 shadow-lg shadow-rose-600/20"
                                >
                                    LIMPAR TUDO 🧹
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <div className="flex-1 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                <ScrollArea
                    className="flex-1 p-4"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                            setShowNewMessageBadge(false);
                        }
                    }}
                    ref={scrollContainerRef}
                >
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Carregando mensagens da arena...
                        </div>
                    ) : error ? (
                        <div className="h-full flex items-center justify-center text-destructive gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Falha ao conectar com o Chat Global.
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground italic">
                            Nenhum grito de guerra ainda. Seja o primeiro!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 py-2">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => {
                                    const isMe = msg.authorId === user?.id || (user?.isAdmin && msg.authorId === "admin");
                                    const isAdmin = msg.authorRank === "Moderador" || msg.authorId === "admin";
                                    const authorPlayer = {
                                        accountId: msg.authorId,
                                        zoneId: msg.authorZoneId || "0000",
                                        gameName: msg.authorName,
                                        avatar: msg.authorAvatar,
                                        activeFrame: msg.authorFrame,
                                        isBanned: false,
                                        streak: 0
                                    } as any;

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                            className={`flex max-w-[80%] gap-3 flex-col sm:flex-row ${isMe ? 'self-end bg-primary/10 rounded-tl-2xl rounded-tr-xl rounded-bl-2xl p-4' : 'self-start bg-card rounded-tl-xl rounded-tr-2xl rounded-br-2xl p-4 border border-border/30'} ${isAdmin ? 'border-primary/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : ''}`}
                                        >
                                            <div className={`flex gap-3 ${isMe ? 'flex-row-reverse text-right' : ''}`}>
                                                <div
                                                    className="cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20"
                                                    onClick={() => setLocation(`/player/${msg.authorId}/${msg.authorZoneId || "0000"}`)}
                                                >
                                                    <PlayerAvatar player={authorPlayer} size="sm" />
                                                </div>

                                                <div className="flex flex-col gap-1 w-full max-w-[100%] break-words">
                                                    <div className={`flex items-baseline gap-2 ${isMe ? 'justify-end' : ''}`}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className={`font-bold hover:underline cursor-pointer text-sm ${isAdmin ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(234,179,8,0.5)]' : 'text-primary'}`}>
                                                                {msg.authorName}
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align={isMe ? "end" : "start"} className="bg-card/95 backdrop-blur-md border-primary/20">
                                                                {msg.authorId !== "admin" && (
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer font-bold text-primary hover:text-primary-foreground focus:bg-primary"
                                                                        onClick={() => setLocation(`/player/${msg.authorId}/${msg.authorZoneId || "0000"}`)}
                                                                    >
                                                                        Ver Perfil
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer font-bold"
                                                                    onClick={() => setNewMessage(`@${msg.authorName}, ${newMessage}`)}
                                                                >
                                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                                    Responder no Chat
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">{msg.authorRank}</span>
                                                    </div>
                                                    <p className={`text-sm leading-relaxed ${isAdmin ? 'font-medium text-foreground' : 'text-foreground/90'} break-words whitespace-pre-wrap`}>
                                                        {msg.content}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground/60 mt-1">
                                                        {format(new Date(msg.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                <AnimatePresence>
                    {showNewMessageBadge && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50"
                        >
                            <Button
                                onClick={() => scrollToBottom()}
                                className="bg-primary/90 text-primary-foreground text-xs font-bold py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 hover:bg-primary"
                            >
                                <Flame className="w-4 h-4 animate-pulse" />
                                Mensagens Novas
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-4 bg-background/50 border-t border-border/50">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Envie seu grito de desafio ou conversa..."
                            className="flex-1 bg-card border-primary/20 focus-visible:ring-primary/50 h-12"
                            disabled={sendMessageMutation.isPending}
                            maxLength={500}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
