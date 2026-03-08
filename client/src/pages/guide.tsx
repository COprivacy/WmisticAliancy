import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Swords, Trophy, Star, Zap, Gift, Shield, Flame, Crown,
    ChevronRight, Sparkles, Clock, Target, Music, ImageIcon,
    Coins, TrendingUp, Package, Users, CalendarCheck, Dices,
    AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.08 } }
};

export default function Guide() {
    return (
        <div className="max-w-5xl mx-auto space-y-16 py-6 relative">

            {/* Background glow */}
            <div className="fixed inset-0 z-[-1] pointer-events-none opacity-10"
                style={{ background: "radial-gradient(ellipse at 30% 20%, hsl(38,92%,50%), transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(250,60%,40%), transparent 60%)" }}
            />

            {/* ===== HERO HEADER ===== */}
            <motion.section {...fadeInUp} className="text-center space-y-6 pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Central de Conhecimento</span>
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <h1 className="text-5xl sm:text-7xl font-serif font-black uppercase tracking-widest text-glow leading-none">
                    Guia da<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-primary to-orange-400">Partida</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest font-bold opacity-70">
                    Tudo que você precisa saber para dominar a arena, conquistar relíquias e ascender ao topo do ranking.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/20 font-black uppercase">Drops de Relíquias</Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/20 font-black uppercase">Bônus Diários</Badge>
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/20 font-black uppercase">Customizações</Badge>
                    <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/20 font-black uppercase">Pontos de Glória</Badge>
                </div>
            </motion.section>

            {/* ===== SECTION 1: COMO GANHAR PONTOS ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Como Evoluir no Ranking</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Acumule pontos e suba de patente</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            icon: Swords, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
                            title: "Vitória em Duelo", value: "+50 PTS",
                            desc: "Reporte uma vitória contra outro membro com print de prova. Após aprovação do conselho, os pontos são creditados automaticamente."
                        },
                        {
                            icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10 border-primary/20",
                            title: "Presença Diária", value: "+5 PTS",
                            desc: "Clique em 'Resgatar Honra' uma vez por dia nos Rankings. Simples assim — aparecer todos os dias já é um ato de glória."
                        },
                        {
                            icon: Target, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20",
                            title: "Derrota em Duelo", value: "-20 PTS",
                            desc: "Cada derrota remove 20 pontos. Use isso a seu favor para estudar seus adversários e retornar mais forte."
                        }
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <Card className={`h-full bg-white/5 border ${item.bg} rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <div>
                                        <span className={`text-2xl font-serif font-black ${item.color}`}>{item.value}</span>
                                        <h3 className="text-sm font-black uppercase tracking-widest mt-1">{item.title}</h3>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== SECTION 2: SISTEMA DE PATENTES ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Crown className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Sistema de Patentes</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Seu posto na hierarquia da Partida</p>
                    </div>
                </motion.div>

                <div className="space-y-3">
                    {[
                        { rank: "Recruta", range: "0 – 99 PTS", color: "text-slate-400", glow: "border-slate-500/20 bg-slate-500/5", icon: "🪖" },
                        { rank: "Soldado", range: "100 – 299 PTS", color: "text-blue-400", glow: "border-blue-500/20 bg-blue-500/5", icon: "⚔️" },
                        { rank: "Guerreiro", range: "300 – 599 PTS", color: "text-emerald-400", glow: "border-emerald-500/20 bg-emerald-500/5", icon: "🛡️" },
                        { rank: "Elite", range: "600 – 999 PTS", color: "text-orange-400", glow: "border-orange-500/20 bg-orange-500/5", icon: "🔥" },
                        { rank: "Mestre", range: "1.000 – 1.999 PTS", color: "text-primary", glow: "border-primary/20 bg-primary/5", icon: "👑" },
                        { rank: "Grande Mestre", range: "2.000+ PTS", color: "text-yellow-300", glow: "border-yellow-400/30 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]", icon: "⚡" }
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}
                            className={`flex items-center justify-between p-5 rounded-2xl border ${item.glow} group hover:scale-[1.01] transition-transform`}>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{item.icon}</span>
                                <div>
                                    <span className={`block text-lg font-serif font-black uppercase tracking-widest ${item.color}`}>{item.rank}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.range}</span>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== SECTION 3: PONTOS DE GLÓRIA ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Coins className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Pontos de Glória</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">A moeda secreta da Partida</p>
                    </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="p-6 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 mb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="text-orange-400 font-black uppercase">Pontos de Glória</span> são a moeda premium do portal. Diferentes dos pontos de ranking, eles <strong className="text-foreground">nunca diminuem</strong> — só acumulam. Use-os para comprar relíquias exclusivas na loja da guilda.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: CalendarCheck, title: "Presença Diária", amount: "+5 Glória", desc: "Cada resgate diário dá também 5 Pontos de Glória além dos pontos de rank." },
                        { icon: Swords, title: "Vitória em Duelo", amount: "+5 Glória", desc: "Quando uma partida é aprovada, o vencedor recebe 5 pontos de Glória como bônus extra." },
                        { icon: Trophy, title: "Fim de Temporada", amount: "Até +2.000 Glória", desc: "Ao resetar a temporada, os melhores jogadores recebem um bônus massivo em Glória. 🏆 1º lugar ganha 2.000, 🥈 2º lugar 1.000, 🥉 3º lugar 500." },
                        { icon: Coins, title: "Recarga PIX", amount: "Vários valores", desc: "Você pode comprar Pontos de Glória diretamente na seção de Glória dos Rankings. Peça ao administrador o pacote disponível." },
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <Card className="h-full bg-white/5 border border-orange-500/10 rounded-3xl group hover:border-orange-500/30 transition-all">
                                <CardContent className="p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                        <item.icon className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-sm uppercase tracking-widest">{item.title}</span>
                                            <Badge className="bg-orange-500/20 text-orange-400 border-none text-[9px] font-black uppercase">{item.amount}</Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== SECTION 4: RELÍQUIAS E DROPS ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Relíquias e Drops</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Os tesouros sagrados do portal</p>
                    </div>
                </motion.div>

                {/* Drop Rematch Banner */}
                <motion.div variants={fadeInUp}
                    className="relative overflow-hidden p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-primary/10 mb-6 group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.1),transparent_60%)] pointer-events-none" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                        <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30 shrink-0">
                            <Dices className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-serif font-black uppercase tracking-widest text-purple-300">Drop Aleatório de Vitória</h3>
                                <Badge className="bg-purple-500/30 text-purple-300 border-purple-400/30 font-black uppercase text-[9px]">Novo!</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                                A cada vitória aprovada em combate, o guerreiro vencedor tem <strong className="text-purple-300">25% de chance</strong> de receber um drop aleatório. O destino pode te dar:
                                <span className="block mt-2 text-white/80">• Uma <strong className="text-purple-300">Relíquia Comum</strong> aleatória</span>
                                <span className="block text-white/80">• Um bônus de <strong className="text-emerald-400">+15 Pontos</strong> de Rank</span>
                                <span className="block text-white/80">• Um bônus de <strong className="text-orange-400">+5 Moedas</strong> de Glória</span>
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                        <Dices className="w-48 h-48 text-purple-300" />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: Gift, title: "Drop por Vitória", color: "text-purple-400", border: "border-purple-500/20", desc: "25% de chance de ganhar uma relíquia, pontos de rank ou glória ao vencer um duelo. O prêmio cai direto na sua conta!" },
                        { icon: Trophy, title: "Prêmios de Ranking", color: "text-primary", border: "border-primary/20", desc: "Ao final da temporada, o admin distribui relíquias exclusivas e únicas para os melhores colocados. Itens impossíveis de comprar." },
                        { icon: Star, title: "Compra na Loja", color: "text-orange-400", border: "border-orange-500/20", desc: "Use seus Pontos de Glória para comprar relíquias disponíveis na loja. Vá em Rankings → Glória e veja os itens disponíveis." },
                        { icon: Shield, title: "Presente do Admin", color: "text-emerald-400", border: "border-emerald-500/20", desc: "Administradores podem presentear relíquias especiais para jogadores como reconhecimento por feitos heroicos dentro da guilda." },
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <Card className={`h-full bg-white/5 border ${item.border} rounded-3xl group hover:bg-white/10 transition-all`}>
                                <CardContent className="p-6 flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 border ${item.border} flex items-center justify-center shrink-0`}>
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className={`block font-black text-sm uppercase tracking-widest ${item.color}`}>{item.title}</span>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== SECTION 5: CUSTOMIZAÇÃO ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Personalização de Perfil</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Mostre sua glória ao mundo</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: ImageIcon,
                            title: "Moldura de Avatar",
                            color: "text-primary",
                            gradient: "from-primary/20 to-primary/5",
                            border: "border-primary/20",
                            desc: "Relíquias do tipo 'Moldura' aparecem ao redor do seu avatar em todas as páginas do sistema — no ranking, no chat global, na sala de guerra e no seu perfil.",
                            tip: "💡 Vá em Meu Perfil → Personalizar Perfil → Estilo"
                        },
                        {
                            icon: Zap,
                            title: "Fundo de Perfil",
                            color: "text-blue-400",
                            gradient: "from-blue-500/20 to-blue-500/5",
                            border: "border-blue-500/20",
                            desc: "Relíquias do tipo 'Fundo' transformam o seu cartão de perfil com uma arte épica exclusiva. Cada jogador que visitar seu perfil verá o fundo ativo.",
                            tip: "💡 Múltiplos fundos podem ser equipados ou trocados a qualquer momento"
                        },
                        {
                            icon: Music,
                            title: "Trilha Sonora",
                            color: "text-purple-400",
                            gradient: "from-purple-500/20 to-purple-500/5",
                            border: "border-purple-500/20",
                            desc: "Relíquias do tipo 'Música' adicionam uma trilha sonora épica ao seu perfil. Visitantes podem ouvir sua música tema ao entrar na sua página.",
                            tip: "💡 O visitante controla o play/pause com o botão ⚡"
                        }
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <div className={`relative h-full p-6 rounded-3xl border ${item.border} bg-gradient-to-b ${item.gradient} space-y-4 group hover:scale-[1.02] transition-transform overflow-hidden`}>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 60%)` }} />
                                <div className={`w-12 h-12 rounded-2xl bg-white/5 border ${item.border} flex items-center justify-center`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className={`font-serif font-black uppercase tracking-widest text-lg ${item.color}`}>{item.title}</h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                <div className={`p-3 rounded-xl bg-white/5 border ${item.border}`}>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.tip}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ===== SECTION 6: STREAK ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Sistema de Sequência (Streak)</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Vitórias consecutivas = Poder crescente</p>
                    </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl border border-orange-500/20 bg-orange-500/5 space-y-4">
                        <h3 className="font-black uppercase tracking-widest text-orange-400">O que é Streak?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Cada vitória consecutiva aumenta seu contador de Streak. Quando você alcança <strong className="text-orange-400">3 vitórias seguidas</strong>, uma chama de fogo 🔥 aparece no seu avatar, visível por todos os membros da guilda.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Uma derrota zera o streak. Proteja sua sequência ou tente quebrar a dos adversários!
                        </p>
                    </div>
                    <div className="space-y-3">
                        {[
                            { fires: "🔥", label: "Streak ≥ 3", desc: "Ícone de chama aparece no seu avatar no ranking" },
                            { fires: "🔥🔥", label: "Streak ≥ 5", desc: "Destaque especial no chat e no seu perfil" },
                            { fires: "💀", label: "Streak zerado", desc: "Derrota remove todas as vitórias consecutivas" }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5">
                                <span className="text-2xl">{s.fires}</span>
                                <div>
                                    <span className="block font-black text-xs uppercase tracking-widest text-orange-400">{s.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.section>

            {/* ===== SECTION 7: CHAT GLOBAL ===== */}
            <motion.section variants={stagger} initial="initial" animate="animate">
                <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-widest">Chat Global</h2>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">A voz dos jogadores, em tempo real</p>
                    </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: Sparkles, title: "Molduras no Chat", desc: "Sua moldura ativa aparece automaticamente ao lado de cada mensagem que você envia. Mostre seu status sem dizer uma palavra." },
                        { icon: Users, title: "Perfis Clicáveis", desc: "Clique no nome ou avatar de qualquer guerreiro para visitar o perfil completo diretamente do chat." },
                        { icon: Clock, title: "Atualização em Tempo Real", desc: "O chat atualiza a cada 3 segundos. Novas mensagens piscam um indicador para você não perder nada." },
                        { icon: AlertCircle, title: "Mensagens do ADM", desc: "Administradores aparecem com nome em dourado e destaque especial. Preste atenção nos comunicados oficiais!" }
                    ].map((item, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <div className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest mb-1">{item.title}</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* ===== CTA FINAL ===== */}
            <motion.section {...fadeInUp} className="relative overflow-hidden p-10 rounded-[2.5rem] border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-center space-y-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <Crown className="w-12 h-12 text-primary mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <div>
                    <h2 className="text-3xl font-serif font-black uppercase tracking-widest text-glow">Pronto para Batalhar?</h2>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-2 opacity-70">
                        A arena aguarda. Cada ponto contado, cada relíquia conquistada.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/rankings">
                        <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/30 hover:bg-primary/90">
                            <Trophy className="w-4 h-4 mr-2" />
                            Ver Rankings
                        </Button>
                    </Link>
                    <Link href="/rules">
                        <Button variant="outline" className="border-primary/20 font-black uppercase tracking-widest h-12 px-8 hover:bg-primary/10">
                            <Shield className="w-4 h-4 mr-2" />
                            Ler as Regras
                        </Button>
                    </Link>
                </div>
            </motion.section>

        </div>
    );
}
