import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Sparkles, Zap, Play, Info, Dices, Flame, Star, X, ChevronRight, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
};

type ArcadeGame = {
    id: number;
    name: string;
    image: string;
    category: string;
    directUrl: string;
    description?: string;
    createdAt: string;
};

export default function Arcade() {
    const { user } = useAuth();
    const [selectedGame, setSelectedGame] = useState<ArcadeGame | null>(null);
    const [adPhase, setAdPhase] = useState<"none" | "opening">("none");
    const [countdown, setCountdown] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");

    // Fetch games from the API (managed via Admin Panel)
    const { data: games = [], isLoading } = useQuery<ArcadeGame[]>({
        queryKey: ["/api/arcade/games"],
    });

    // Build dynamic categories from fetched games
    const dynamicCategories = ["Todos", ...Array.from(new Set(games.map(g => g.category)))];

    const handlePlayGame = (game: ArcadeGame) => {
        setSelectedGame(game);
        setAdPhase("opening");
        setCountdown(5);
    };

    const handleCloseAd = () => {
        setAdPhase("none");
        setSelectedGame(null);
    };

    // Countdown logic — only counts down, no auto-redirect
    useEffect(() => {
        if (adPhase === "opening" && selectedGame && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
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

    const filteredGames = games.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (game.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "Todos" || game.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="relative min-h-screen">
            {/* Fixed gaming background */}
            <div className="fixed inset-0 -z-10">
                <img
                    src="/images/arcade-bg.png"
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-[#020617]/85" />
                {/* Gradient edges for smooth blending */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
                {/* Subtle animated glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(234,179,8,0.06),transparent_60%)]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-12 py-6 relative z-0">

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
                                A diversão não para quando o rank termina. Explore jogos instantâneos para você dominar e relaxar entre as partidas.
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
                                Todos os jogos abrem direto no navegador. Jogue instantaneamente no PC ou Mobile sem baixar nada.
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
                            {dynamicCategories.map(cat => (
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

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Carregando jogos...</p>
                        </div>
                    ) : filteredGames.length > 0 ? (
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
                                                {game.description || "Jogue agora e divirta-se!"}
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
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                {games.length === 0 ? "Nenhum jogo cadastrado ainda. Aguarde o admin adicionar os jogos!" : "Nenhum jogo encontrado com esses critérios."}
                            </p>
                            {games.length > 0 && (
                                <Button variant="link" onClick={() => { setSearchTerm(""); setActiveCategory("Todos"); }} className="text-primary uppercase tracking-widest text-xs font-black">Limpar Filtros</Button>
                            )}
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
                                onClick={handleCloseAd}
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
                                        Encaminhando para o Jogo
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
                                    {countdown > 0 ? (
                                        /* Countdown in progress */
                                        <>
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
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50 animate-pulse">
                                                Aguarde o anúncio terminar...
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="w-full border-white/10 bg-white/5 font-black uppercase tracking-widest h-12 hover:bg-white/10"
                                                onClick={handleCloseAd}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        /* Ad finished — show play button */
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full space-y-4"
                                        >
                                            <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest text-center">
                                                ✅ Anúncio concluído! Clique abaixo para jogar.
                                            </p>
                                            <div className="flex gap-4 w-full">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-white/10 bg-white/5 font-black uppercase tracking-widest h-14 hover:bg-white/10"
                                                    onClick={handleCloseAd}
                                                >
                                                    Voltar
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-primary text-black font-black uppercase tracking-widest h-14 shadow-lg shadow-primary/30 group hover:scale-[1.02] transition-transform"
                                                    onClick={() => {
                                                        window.location.href = selectedGame.directUrl;
                                                    }}
                                                >
                                                    Jogar Agora
                                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
                                    SPG Arcade Alliance
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
