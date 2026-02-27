import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Crown, Calendar, ChevronLeft, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HallOfFame() {
    const { data: seasons, isLoading } = useQuery<any[]>({
        queryKey: ["/api/seasons"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 relative px-4 pt-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/rankings">
                    <Button variant="ghost" className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white group">
                        <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        VOLTAR
                    </Button>
                </Link>

                <div className="mb-16 text-center">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500/20 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-glow">Mural da Glória</h1>
                    </div>
                    <p className="text-muted-foreground uppercase tracking-[0.4em] text-xs">A linhagem dos imortais da arena</p>
                </div>

                <div className="space-y-12">
                    {seasons && seasons.length > 0 ? (
                        seasons.map((season, i) => (
                            <motion.div
                                key={season.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
                                <div className="flex flex-col md:flex-row items-center gap-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 overflow-hidden">
                                    <div className="md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 space-y-4">
                                        <Badge className="bg-primary/20 text-primary uppercase tracking-widest px-4 py-1">TEMPORADA FINALIZADA</Badge>
                                        <h2 className="text-2xl font-serif text-center uppercase tracking-widest text-white">{season.name}</h2>
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(season.endedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Rank 1 */}
                                            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-all">
                                                <div className="relative">
                                                    <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                                                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black font-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1º</div>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black uppercase text-white truncate w-full">{season.championName}</p>
                                                    <span className="text-[10px] text-yellow-500 uppercase font-black tracking-widest">CAMPEÃO</span>
                                                </div>
                                            </div>

                                            {/* Rank 2 */}
                                            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-slate-300/5 border border-slate-300/10 group hover:bg-slate-300/10 transition-all">
                                                <div className="relative">
                                                    <Medal className="w-12 h-12 text-slate-300" />
                                                    <div className="absolute -top-2 -right-2 bg-slate-300 text-black font-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2º</div>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black uppercase text-white truncate w-full">{season.secondName || 'N/A'}</p>
                                                    <span className="text-[10px] text-slate-300 uppercase font-black tracking-widest">VICE-CAMPEÃO</span>
                                                </div>
                                            </div>

                                            {/* Rank 3 */}
                                            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 group hover:bg-orange-500/10 transition-all">
                                                <div className="relative">
                                                    <Star className="w-12 h-12 text-orange-500" />
                                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-black font-black w-6 h-6 rounded-full flex items-center justify-center text-xs">3º</div>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black uppercase text-white truncate w-full">{season.thirdName || 'N/A'}</p>
                                                    <span className="text-[10px] text-orange-500 uppercase font-black tracking-widest">TERCEIRO LUGAR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/5 backdrop-blur-xl">
                            <Trophy className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-serif uppercase tracking-widest text-muted-foreground mb-4">A história ainda está sendo escrita</h3>
                            <p className="text-muted-foreground/60 max-w-md mx-auto italic">O Mural da Glória aguarda os primeiros heróis que conquistarão o topo desta temporada.</p>
                            <Link href="/rankings">
                                <Button className="mt-8 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">BUSCAR O TOPO</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
