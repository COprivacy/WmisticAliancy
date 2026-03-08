import { motion } from "framer-motion";
import { Gamepad2, Trophy, Sparkles, Zap, Play, Info, ExternalLink, Dices, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export default function Arcade() {
    const { user } = useAuth();

    // Placeholder for Gamezop Link - User will replace this with their unique ID
    const gamezopUrl = "https://www.gamezop.com/g/placeholder";

    const featuredGames = [
        { id: "action", name: "Ação & Aventura", icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10", desc: "Desafie seus reflexos em jogos intensos." },
        { id: "puzzle", name: "Estratégia & Puzzle", icon: Brain, color: "text-blue-400", bg: "bg-blue-500/10", desc: "Mantenha a mente afiada entre um rank e outro." },
        { id: "sports", name: "Esportes & Corrida", icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Velocidade e precisão no seu navegador." },
        { id: "classic", name: "Clássicos Arcade", icon: Gamepad2, color: "text-primary", bg: "bg-primary/10", desc: "Os favoritos de todos os tempos." },
    ];

    const handlePlayNow = () => {
        // Here we could open the Gamezop portal
        window.open(gamezopUrl, "_blank");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-6">

            {/* HERO SECTION */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden p-10 md:p-16 rounded-[2.5rem] border border-primary/20 bg-[#020617] group shadow-2xl"
            >
                {/* Visual Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.15),transparent_70%)] pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-1000" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 uppercase tracking-widest font-black text-[10px]">
                            <Sparkles className="w-3 h-3 mr-2 inline" />
                            Parceria Gamezop • Em Breve
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter text-glow leading-none">
                            SPG <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-primary to-orange-500">ARCADE</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-xl font-medium leading-relaxed uppercase tracking-wide opacity-80">
                            A diversão não para quando o rank termina. Em parceria com a Gamezop, traremos +250 jogos instantâneos para você dominar.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Button size="lg" onClick={handlePlayNow} className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Play className="w-5 h-5 mr-3 fill-current" />
                                Abrir Game Center
                            </Button>
                            <Button variant="outline" size="lg" className="border-white/10 bg-white/5 font-black uppercase tracking-widest h-14 px-8 hover:bg-white/10">
                                <Info className="w-5 h-5 mr-3" />
                                Como Funciona
                            </Button>
                        </div>
                    </div>

                    <div className="w-full md:w-auto relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-700" />
                        <motion.div
                            animate={{ rotate: [0, 5, 0, -5, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="relative bg-[#0a101f] border border-white/10 p-8 rounded-[3rem] shadow-2xl"
                        >
                            <Gamepad2 className="w-40 h-40 text-primary drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* REWARD SYSTEM INFO */}
            <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
                    <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Jogue & Ganhe</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-widest opacity-60">
                            Em breve, suas pontuações no Arcade poderão ser convertidas em Pontos de Glória no portal.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-blue-500/30 transition-colors">
                    <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Sem Instalação</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-widest opacity-60">
                            Todos os jogos são em HTML5. Jogue instantaneamente no PC ou Mobile sem baixar nada.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-orange-500/30 transition-colors">
                    <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Tourneios</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-widest opacity-60">
                            Competições semanais com premiações exclusivas para os recordistas do Game Center SPG.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* GAME CATEGORIES */}
            <motion.section variants={stagger} initial="initial" animate="animate" className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div>
                        <h2 className="text-3xl font-serif font-black uppercase tracking-widest italic">Categorias de Elite</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1 opacity-60">O melhor da Gamezop selecionado para você</p>
                    </div>
                    <Button variant="ghost" onClick={handlePlayNow} className="text-xs font-black uppercase tracking-widest hover:text-primary group">
                        Ver Mais <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredGames.map((game) => (
                        <motion.div key={game.id} variants={fadeInUp}>
                            <Card className="bg-[#0a101f] border-white/5 hover:border-white/20 transition-all rounded-[2rem] overflow-hidden group hover:-translate-y-2">
                                <CardContent className="p-8 space-y-4 relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[4rem] group-hover:bg-primary/5 transition-colors" />
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${game.bg} border border-white/5`}>
                                        <game.icon className={`w-7 h-7 ${game.color}`} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-widest">{game.name}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-relaxed">
                                        {game.desc}
                                    </p>
                                    <Button onClick={handlePlayNow} variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest mt-4 bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                                        Explorar
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* CALL TO ACTION */}
            <motion.section
                {...fadeInUp}
                className="text-center bg-gradient-to-br from-primary/10 to-transparent p-12 rounded-[3rem] border border-primary/10 space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Novo de Experiência</span>
                </div>
                <h2 className="text-4xl font-serif font-black uppercase tracking-[0.2em] leading-tight">Mantenha a Brasa Acesa</h2>
                <p className="max-w-2xl mx-auto text-sm text-muted-foreground uppercase font-bold tracking-widest leading-loose opacity-70">
                    Enquanto desafiamos a Gamezop para a integração final, você já pode testar o catálogo e se preparar para a nova era do entretenimento na SUA PARTIDA GAMER.
                </p>
                <Button size="lg" onClick={handlePlayNow} className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] h-14 px-12 rounded-2xl shadow-xl active:scale-95 transition-all">
                    Iniciar Experiência
                </Button>
            </motion.section>

        </div>
    );
}

function Brain(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
        </svg>
    )
}
