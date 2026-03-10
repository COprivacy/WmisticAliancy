import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Sparkles, Zap, Play, Info, ExternalLink, Dices, Flame, Star, X, Maximize2, Minimize2, Timer, Award, Share2, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
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

type Game = {
    id: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    desc: string;
};

// Configuration for Gamezop
const GAMEZOP_PROPERTY_ID = "S1Pr96p_r"; // ID de Publicador SPG

const ARCADE_GAMES: Game[] = [
    { id: "1", name: "Campeões do Basquete", slug: "S1_V6GyP5ym", image: "https://static.gamezop.com/S1_V6GyP5ym/square.png", category: "Esportes", desc: "Arremesse e enterre para se tornar o rei das quadras." },
    { id: "2", name: "Mestre do Bilhar", slug: "hgempP8Sc", image: "https://static.gamezop.com/hgempP8Sc/square.png", category: "Esportes", desc: "Domine a mesa de sinuca nesta simulação realista de 8-ball." },
    { id: "3", name: "Aventura de Blocos Selva", slug: "UCS62KJ8c", image: "https://static.gamezop.com/UCS62KJ8c/square.png", category: "Puzzle", desc: "Combine as peças neste puzzle viciante nas profundezas da selva." },
    { id: "4", name: "Bubble Shooter Clássico", slug: "yVywAGBQ6", image: "https://static.gamezop.com/yVywAGBQ6/square.png", category: "Puzzle", desc: "Estoure todas as bolhas antes que elas alcancem o chão." },
    { id: "5", name: "Explosão de Rochas", slug: "HkTQJhTXqRS", image: "https://static.gamezop.com/HkTQJhTXqRS/square.png", category: "Ação", desc: "Proteja-se e destrua as rochas espaciais nesta jornada arcade." },
    { id: "6", name: "Tiro na Garrafa", slug: "B1fSpMkP51m", image: "https://static.gamezop.com/B1fSpMkP51m/square.png", category: "Ação", desc: "Teste sua precisão atirando em garrafas em movimento." },
    { id: "7", name: "Assalto ao Saloon", slug: "SJ8X6zyPcyX", image: "https://static.gamezop.com/SJ8X6zyPcyX/square.png", category: "Ação", desc: "Seja o gatilho mais rápido do Velho Oeste nesta perseguição." },
    { id: "8", name: "Cavaleiro Ardente", slug: "yr4TqJhLr", image: "https://static.gamezop.com/yr4TqJhLr/square.png", category: "Corrida", desc: "Pise fundo e evite os obstáculos em alta velocidade." },
    { id: "9", name: "Estrelas do Boliche", slug: "BkdJhTX50B", image: "https://static.gamezop.com/BkdJhTX50B/square.png", category: "Esportes", desc: "Faça o strike perfeito e conquiste os troféus das ligas." },
    { id: "10", name: "Cyberfusion", slug: "HJXei0j", image: "https://static.gamezop.com/HJXei0j/square.png", category: "Puzzle", desc: "Fundir peças tecnológicas para criar o circuito definitivo." },
];

const CATEGORIES = ["Todos", "Ação", "Esportes", "Puzzle", "Corrida"];

export default function Arcade() {
    const { user } = useAuth();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [adPhase, setAdPhase] = useState<"none" | "opening">("none");
    const [countdown, setCountdown] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");

    // Gamezop Integration - Launching games directly with Property ID
    const getGameUrl = (slug: string) => {
        return `https://www.gamezop.com/g/${slug}?id=${GAMEZOP_PROPERTY_ID}`;
    };

    const handlePlayGame = (game: Game) => {
        setSelectedGame(game);
        setAdPhase("opening");
        setCountdown(5);
    };

    const handleSkipAd = () => {
        if (selectedGame) {
            window.location.href = getGameUrl(selectedGame.slug);
        }
    };

    const handleCloseAd = () => {
        setAdPhase("none");
        setSelectedGame(null);
    };

    // Countdown logic for the redirect ad
    useEffect(() => {
        if (adPhase === "opening" && selectedGame) {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                // Auto-redirect when countdown ends
                window.location.href = getGameUrl(selectedGame.slug);
            }
        }
    }, [adPhase, countdown, selectedGame]);

    // Prevent scrolling when ad is active
    useEffect(() => {
        if (adPhase === "opening") {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [adPhase]);

    const filteredGames = ARCADE_GAMES.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.desc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "Todos" || game.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

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
                            Catálogo Premium Ativado
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter text-glow leading-none">
                            SPG <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-primary to-orange-500">ARCADE</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-xl font-medium leading-relaxed uppercase tracking-wide opacity-80">
                            A diversão não para quando o rank termina. Explore centenas de jogos instantâneos para você dominar e relaxar entre as partidas.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Button size="lg" onClick={() => {
                                const el = document.getElementById("game-catalog");
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }} className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
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

            {/* GAME CATEGORIES / GRID */}
            <motion.section id="game-catalog" variants={stagger} initial="initial" animate="animate" className="space-y-8 scroll-mt-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-3xl font-serif font-black uppercase tracking-widest italic leading-tight">Catálogo de Jogos</h2>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1 opacity-60">Escolha sua próxima aventura</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md group">
                            <Dices className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="PROCURAR JOGO..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGames.map((game) => (
                            <motion.div key={game.id} variants={fadeInUp}>
                                <Card className="bg-[#0a101f] border-white/5 hover:border-primary/30 transition-all rounded-[2rem] overflow-hidden group hover:-translate-y-2 cursor-pointer shadow-xl shadow-black/40" onClick={() => handlePlayGame(game)}>
                                    <div className="relative aspect-video overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                        <img
                                            src={game.image}
                                            alt={game.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <Badge className="absolute top-4 right-4 z-20 bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-black">
                                            {game.category}
                                        </Badge>
                                        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Play className="w-4 h-4 text-black fill-current" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Jogar Agora</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 space-y-2">
                                        <h3 className="text-base font-black uppercase tracking-widest group-hover:text-primary transition-colors truncate">{game.name}</h3>
                                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider leading-relaxed line-clamp-2">
                                            {game.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Nenhum jogo encontrado com esses critérios.</p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setActiveCategory("Todos"); }} className="text-primary uppercase tracking-widest text-xs font-black">Limpar Filtros</Button>
                    </div>
                )}
            </motion.section>

            {/* CALL TO ACTION */}
            <motion.section
                {...fadeInUp}
                className="text-center bg-gradient-to-br from-primary/10 to-transparent p-12 rounded-[3rem] border border-primary/10 space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Monetização & ADS</span>
                </div>
                <h2 className="text-4xl font-serif font-black uppercase tracking-[0.2em] leading-tight">Espaço Publicitário</h2>
                <p className="max-w-2xl mx-auto text-sm text-muted-foreground uppercase font-bold tracking-widest leading-loose opacity-70">
                    Integre seus banners do AdSense ou scripts personalizados nas transições de abertura e fechamento para monetizar sua audiência de forma sutil.
                </p>
                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] h-14 px-12 rounded-2xl shadow-xl active:scale-95 transition-all">
                    Configurar Anúncios
                </Button>
            </motion.section>

            {/* FULLSCREEN AD OVERLAY / REDIRECTING */}
            <AnimatePresence>
                {adPhase === "opening" && selectedGame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-6 text-center"
                    >
                        {/* High Quality Background Effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1),transparent_70%)]" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-primary shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-6 text-white/40 hover:text-white"
                            onClick={() => { setAdPhase("none"); setSelectedGame(null); }}
                        >
                            <X className="w-8 h-8" />
                        </Button>

                        <div className="relative space-y-8 max-w-lg w-full">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-auto w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20"
                            >
                                <img src={selectedGame.image} alt={selectedGame.name} className="w-full h-full object-cover" />
                            </motion.div>

                            <div className="space-y-2">
                                <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase tracking-widest text-[10px] px-4 py-1">
                                    Encaminhando para Arena
                                </Badge>
                                <h2 className="text-4xl font-serif font-black uppercase tracking-tighter text-glow truncate px-4">
                                    {selectedGame.name}
                                </h2>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-[0.2em] opacity-60">
                                    Preparando sua sessão de jogo...
                                </p>
                            </div>

                            {/* Ad Space Placeholder (Premium Look) */}
                            <div className="aspect-video w-full bg-white/5 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-6 space-y-4 shadow-inner">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-primary/80">Espaço Publicitário Premium</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Seu anúncio AdSense ou patrocinador aqui</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-white/5"
                                        />
                                        <motion.circle
                                            cx="40"
                                            cy="40"
                                            r="36"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeDasharray="226.2"
                                            initial={{ strokeDashoffset: 0 }}
                                            animate={{ strokeDashoffset: 226.2 }}
                                            transition={{ duration: 5, ease: "linear" }}
                                            className="text-primary"
                                        />
                                    </svg>
                                    <span className="text-3xl font-black font-serif italic">{countdown}</span>
                                </div>

                                <div className="flex gap-4 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-white/10 bg-white/5 font-black uppercase tracking-widest h-12 hover:bg-white/10"
                                        onClick={() => { setAdPhase("none"); setSelectedGame(null); }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-primary text-black font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20 group"
                                        onClick={() => window.location.href = getGameUrl(selectedGame.slug)}
                                    >
                                        Pular Ad
                                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
                                Powered by Gamezop • SPG Arcade Alliance
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
