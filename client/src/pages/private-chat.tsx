import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send, MessageSquare, AlertCircle, Loader2, User as UserIcon, ArrowLeft, MoreVertical, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "@/components/player-avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PrivateMessage = {
    id: number;
    senderId: string;
    senderZone: string;
    receiverId: string;
    receiverZone: string;
    content: string;
    createdAt: string;
    isRead: boolean;
};

type Conversation = {
    id: string;
    zone: string;
    gameName: string;
    avatar: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
};

export default function PrivateChat() {
    const { user } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const [, setLocation] = useLocation();
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const activeId = params.id;
    const activeZone = params.zone;

    // Fetch list of conversations
    const { data: conversations = [], isLoading: isLoadingConvs } = useQuery<Conversation[]>({
        queryKey: ["/api/chat/conversations"],
        refetchInterval: 5000,
    });

    // Fetch messages for active conversation
    const { data: messages = [], isLoading: isLoadingMsgs } = useQuery<PrivateMessage[]>({
        queryKey: [`/api/chat/private/${activeId}/${activeZone}`],
        enabled: !!activeId && !!activeZone,
        refetchInterval: 3000,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest("POST", `/api/chat/private/${activeId}/${activeZone}`, { content });
            return await res.json();
        },
        onSuccess: (newMsg) => {
            queryClient.setQueryData([`/api/chat/private/${activeId}/${activeZone}`], (old: PrivateMessage[] | undefined) => {
                if (!old) return [newMsg];
                return [...old, newMsg];
            });
            setNewMessage("");
            queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        },
        onError: (err: Error) => {
            toast({
                title: "Erro ao enviar",
                description: err.message || "Tente novamente mais tarde.",
                variant: "destructive"
            });
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sendMessageMutation.isPending || !activeId) return;
        sendMessageMutation.mutate(newMessage);
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [messages.length]);

    const activeConversation = conversations.find(c => c.id === activeId && c.zone === activeZone);
    const filteredConversations = conversations.filter(c =>
        c.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.includes(searchQuery)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex gap-4 overflow-hidden"
        >
            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-80 flex-shrink-0 flex flex-col gap-4 ${activeId ? 'hidden md:flex' : 'flex'}`}>
                <Card className="flex-1 bg-card/40 backdrop-blur-md border border-white/5 flex flex-col overflow-hidden rounded-3xl">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5" />
                            Mensagens
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar guerreiro..."
                                className="pl-10 bg-white/5 border-white/10 text-xs h-10 rounded-xl focus-visible:ring-primary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {isLoadingConvs ? (
                                <div className="p-8 text-center text-xs text-muted-foreground uppercase font-bold animate-pulse">
                                    Convocando contatos...
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed">
                                        Nenhum diálogo<br />encontrado.
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <div
                                        key={`${conv.id}-${conv.zone}`}
                                        onClick={() => setLocation(`/chat/private/${conv.id}/${conv.zone}`)}
                                        className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 group relative
                                            ${activeId === conv.id && activeZone === conv.zone
                                                ? 'bg-primary/20 border border-primary/20 shadow-lg shadow-primary/5'
                                                : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <PlayerAvatar player={{
                                            accountId: conv.id,
                                            zoneId: conv.zone,
                                            gameName: conv.gameName,
                                            avatar: conv.avatar,
                                            isBanned: false,
                                            streak: 0
                                        } as any} size="sm" />

                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className={`text-xs font-black uppercase truncate ${activeId === conv.id ? 'text-primary' : 'text-foreground'}`}>
                                                    {conv.gameName}
                                                </h3>
                                                {conv.lastMessageAt && (
                                                    <span className="text-[8px] text-muted-foreground font-black whitespace-nowrap">
                                                        {format(new Date(conv.lastMessageAt), "HH:mm")}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate italic opacity-70">
                                                {conv.lastMessage || "Iniciar conversa..."}
                                            </p>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            {/* Main: Chat Area */}
            <Card className={`flex-1 bg-card/30 backdrop-blur-xl border border-white/5 flex flex-col overflow-hidden rounded-3xl ${!activeId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {!activeId ? (
                    <div className="text-center p-8 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-2">
                            <MessageSquare className="w-10 h-10 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-serif uppercase tracking-widest text-primary/50">Canal Seguro</h3>
                        <p className="max-w-xs text-xs text-muted-foreground uppercase font-bold tracking-widest leading-loose opacity-60">
                            Selecione um guerreiro ao lado ou use o botão de mensagem no perfil para iniciar um diálogo privado.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setLocation("/chat/private")}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                {activeConversation ? (
                                    <>
                                        <PlayerAvatar player={{
                                            accountId: activeId,
                                            zoneId: activeZone,
                                            gameName: activeConversation.gameName,
                                            avatar: activeConversation.avatar,
                                            isBanned: false,
                                            streak: 0
                                        } as any} size="sm" />
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">{activeConversation.gameName}</h3>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {activeId} ({activeZone})</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-white/5" />
                                        <div className="space-y-2">
                                            <div className="w-24 h-3 bg-white/5 rounded" />
                                            <div className="w-16 h-2 bg-white/5 rounded" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={() => setLocation(`/player/${activeId}/${activeZone}`)}>
                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            {isLoadingMsgs ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary uppercase text-[8px] font-black tracking-widest">Início do Diálogo</Badge>
                                    <p className="text-xs uppercase font-bold tracking-widest leading-relaxed">
                                        Nenhuma mensagem entre vocês.<br />Quebre o gelo com um grito de guerra!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="text-center mb-8">
                                        <Badge variant="outline" className="border-white/5 text-[8px] text-muted-foreground uppercase font-black tracking-[0.2em] bg-white/[0.02]">
                                            Criptografia de Alma Ativada • Canal Privado
                                        </Badge>
                                    </div>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderId === user?.id;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-3xl relative
                                                    ${isMe
                                                        ? 'bg-primary text-black rounded-tr-none shadow-lg shadow-primary/30'
                                                        : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}
                                                >
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                                    <div className={`flex items-center gap-1.5 mt-2 justify-end ${isMe ? 'text-black/50' : 'text-white/40'}`}>
                                                        <span className="text-[8px] font-black uppercase">
                                                            {format(new Date(msg.createdAt), "HH:mm")}
                                                        </span>
                                                        {isMe && (
                                                            <span className="text-[10px] font-bold">
                                                                {msg.isRead ? "✓✓" : "✓"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem privada..."
                                    className="flex-1 bg-white/5 border-white/10 focus-visible:ring-primary/50 h-14 rounded-2xl px-6 text-sm"
                                    disabled={sendMessageMutation.isPending}
                                    maxLength={500}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                                >
                                    {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </form>
                            <p className="text-[8px] text-muted-foreground mt-2 text-center uppercase font-black tracking-widest opacity-40">
                                Limite de 50 mensagens por conversa. As mais antigas são destruídas automaticamente.
                            </p>
                        </div>
                    </>
                )}
            </Card>
        </motion.div>
    );
}
