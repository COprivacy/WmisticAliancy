import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Sparkles, Zap, Play, Info, ExternalLink, Dices, Flame, Star, X, Maximize2, Minimize2, Timer, Award, Share2 } from "lucide-react";
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

const ARCADE_GAMES: Game[] = [
    { id: "1", name: "Moto X3M Pool Party", slug: "f804d079d19f44d3b951ead4588e974a", image: "https://img.gamedistribution.com/f804d079d19f44d3b951ead4588e974a-512x512.jpg", category: "Corrida", desc: "Desafie a gravidade em pistas aquáticas insanas." },
    { id: "2", name: "Basketball Stars", slug: "69d78d071f704fa183d75b4114ae40ec", image: "https://img.gamedistribution.com/69d78d071f704fa183d75b4114ae40ec-512x512.jpg", category: "Esportes", desc: "Arremesse como um profissional neste simulador 3D." },
    { id: "3", name: "Penalty Challenge", slug: "14b5bd0218824dd3965eed3b186d936f", image: "https://img.gamedistribution.com/14b5bd0218824dd3965eed3b186d936f-512x512.jpg", category: "Esportes", desc: "O destino da taça está nos seus pés." },
    { id: "4", name: "Slither.io World", slug: "24c7905f9e6b4b00bb7f1b7b1751b657", image: "https://img.gamedistribution.com/24c7905f9e6b4b00bb7f1b7b1751b657-512x512.jpg", category: "Ação", desc: "Cresça e domine o mapa neste clássico viciante." },
    { id: "5", name: "Drift Cup Racing", slug: "90da57f920214690838612741d448375", image: "https://img.gamedistribution.com/90da57f920214690838612741d448375-512x512.jpg", category: "Corrida", desc: "Queime pneus nas curvas mais fechadas." },
    { id: "6", name: "Table Tennis World", slug: "fd040a44274c4a45a30e7c5b65103417", image: "https://img.gamedistribution.com/fd040a44274c4a45a30e7c5b65103417-512x512.jpg", category: "Esportes", desc: "Torne-se o mestre da raquete em escala mundial." },
    { id: "7", name: "Fireboy & Watergirl 1", slug: "a55c9cc9c21e4fc683c8c6857f3d0c75", image: "https://img.gamedistribution.com/a55c9cc9c21e4fc683c8c6857f3d0c75-512x512.jpg", category: "Puzzle", desc: "Explore o Templo da Floresta com os elementais." },
    { id: "8", name: "8 Ball Pool", slug: "d02120780e594158ab61869028223cf1", image: "https://img.gamedistribution.com/d02120780e594158ab61869028223cf1-512x512.jpg", category: "Esportes", desc: "O clássico bilhar online contra jogadores reais." },
    { id: "9", name: "Moto X3M 4 Winter", slug: "bcacf81441bd4c7799a622171116ea9d", image: "https://img.gamedistribution.com/bcacf81441bd4c7799a622171116ea9d-512x512.jpg", category: "Corrida", desc: "Acrobacias na neve em pistas geladas mortais." },
    { id: "10", name: "Bob the Robber 4 Japan", slug: "8c16e991b9bf4dfab0942772d77483f7", image: "https://img.gamedistribution.com/8c16e991b9bf4dfab0942772d77483f7-512x512.jpg", category: "Aventura", desc: "Seja o ladrão mais furtivo do mundo nesta nova missão." },
    { id: "11", name: "Snail Bob 7", slug: "40d04588e974a81419c0de9b47e8bd63", image: "https://img.gamedistribution.com/40d04588e974a81419c0de9b47e8bd63-512x512.jpg", category: "Aventura", desc: "Ajude Bob a enfrentar monstros no mundo da fantasia." },
    { id: "12", name: "Troll Face Quest", slug: "1894a81419c0de9b47e8bd63ad6e053d", image: "https://img.gamedistribution.com/1894a81419c0de9b47e8bd63ad6e053d-512x512.jpg", category: "Puzzle", desc: "Resolva os quebra-cabeças mais insanos e engraçados." },
];

const CATEGORIES = ["Todos", "Corrida", "Esportes", "Ação", "Puzzle", "Aventura"];

export default function Arcade() {
    const { user } = useAuth();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [adPhase, setAdPhase] = useState<"none" | "opening" | "playing" | "closing">("none");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");

    // Dynamic GameDistribution URL - Using the direct embed format which is more reliable
    const getGameUrl = (slug: string) => {
        return `https://html5.gamedistribution.com/${slug}/?gd_sdk_referrer_url=${encodeURIComponent(window.location.origin)}`;
    };

    const handlePlayGame = (game: Game) => {
        setSelectedGame(game);
        setAdPhase("opening");
        setCountdown(5);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleSkipAd = () => {
        setAdPhase("playing");
    };

    const handleClosePlayer = () => {
        if (adPhase === "playing") {
            setAdPhase("closing");
        } else {
            setAdPhase("none");
            setSelectedGame(null);
            setIsFullscreen(false);
        }
    };

    // Countdown logic for the opening ad
    useEffect(() => {
        if (adPhase === "opening" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (adPhase === "opening" && countdown === 0) {
            // Auto-start the game when countdown ends
            setAdPhase("playing");
        }
    }, [adPhase, countdown]);

    // Prevent scrolling when playing in "fullscreen" mode within the site
    useEffect(() => {
        if (isFullscreen || adPhase !== "none") {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isFullscreen, adPhase]);

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

            {/* INTEGRATED GAME PLAYER (IFRAME) + AD SYSTEM */}
            <AnimatePresence>
                {adPhase !== "none" && selectedGame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
                    >
                        {/* Backdrop Blur */}
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`relative w-full h-full bg-background border border-white/10 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${isFullscreen ? 'rounded-none' : 'rounded-3xl'}`}
                        >

                            {/* Player Header */}
                            <div className="bg-card/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Gamepad2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest">{selectedGame.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sua Partida Gamer • Arcade</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {adPhase === "playing" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleFullscreen}
                                            className="hover:bg-white/5 text-muted-foreground hover:text-white"
                                        >
                                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClosePlayer}
                                        className="hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 relative overflow-hidden flex flex-col">
                                {/* PHASE 1: OPENING AD INTERSTITIAL */}
                                {adPhase === "opening" && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]">
                                        <div className="max-w-md w-full p-8 text-center space-y-8">
                                            <div className="space-y-2">
                                                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest">Iniciando Partida</Badge>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">O jogo começa em instantes...</h3>
                                            </div>

                                            {/* PLACEHOLDER FOR THE AD */}
                                            <div className="aspect-[4/3] bg-card border border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 shadow-2xl shadow-primary/5">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                                    <Timer className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Espaço do seu Anúncio</p>
                                                    <p className="text-xs font-medium text-white/50 italic">"Insira aqui seu código HTML/Script de Publicidade"</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-4">
                                                {countdown > 0 ? (
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                                                        Aguarde {countdown}s para pular
                                                    </p>
                                                ) : (
                                                    <Button
                                                        onClick={handleSkipAd}
                                                        className="bg-primary text-black font-black uppercase tracking-widest px-12 h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                    >
                                                        Pular e Jogar <Play className="w-4 h-4 ml-2 fill-current" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PHASE 2: GAMEPLAY (IFRAME) */}
                                {adPhase === "playing" && (
                                    <iframe
                                        src={getGameUrl(selectedGame!.slug)}
                                        className="w-full h-full border-none"
                                        title={selectedGame.name}
                                        allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
                                    />
                                )}

                                {/* PHASE 3: CLOSING AD / SUMMARY */}
                                {adPhase === "closing" && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-md">
                                        <div className="max-w-2xl w-full p-8 space-y-10">
                                            <div className="flex items-center gap-6 justify-center">
                                                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20">
                                                    <img src={selectedGame.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-4xl font-black uppercase italic tracking-tighter text-glow">Partida Encerrada</h3>
                                                    <p className="text-muted-foreground uppercase font-bold tracking-widest text-xs">Obrigado por jogar no SPG Arcade</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Left: Summary/Points */}
                                                <Card className="bg-card/40 border-white/5 p-6 rounded-[2rem] space-y-4">
                                                    <Award className="w-10 h-10 text-primary" />
                                                    <h4 className="text-lg font-black uppercase tracking-widest">Bônus Recebido</h4>
                                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">+10 Pontos de Glória em breve!</p>
                                                </Card>

                                                {/* Right: AD SPOT */}
                                                <Card className="bg-primary/5 border-primary/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2 group hover:bg-primary/10 transition-colors">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Sponsor Ad</div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-white/50">Confira nossas ofertas exclusivas</div>
                                                    <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="w-1/2 h-full bg-primary" />
                                                    </div>
                                                </Card>
                                            </div>

                                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                                <Button size="lg" onClick={() => setAdPhase("playing")} className="bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest h-14 px-8 border border-white/10 rounded-2xl">
                                                    <Play className="w-4 h-4 mr-3" /> Jogar Novamente
                                                </Button>
                                                <Button size="lg" onClick={() => { setAdPhase("none"); setSelectedGame(null); }} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 shadow-xl shadow-primary/20 rounded-2xl">
                                                    Voltar ao Lobby
                                                </Button>
                                                <Button variant="ghost" size="lg" className="w-full md:w-auto h-14 text-muted-foreground font-black uppercase tracking-widest hover:text-white">
                                                    <Share2 className="w-4 h-4 mr-3" /> Compartilhar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Player Footer (Mini) */}
                            <div className="bg-card/50 px-6 py-2 flex items-center justify-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-[0.3em]">
                                    Powered by <span className="text-primary">Game Distribution</span> • Integrated with SPG Ads
                                </p>
                            </div>
                        </motion.div>
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
