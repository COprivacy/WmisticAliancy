import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Scale,
    ShieldAlert,
    Ban,
    Flag,
    Clock,
    Camera,
    Flame,
    Award,
    ChevronRight,
    ScrollText,
    AlertTriangle
} from "lucide-react";

export default function Rules() {
    const rules = [
        {
            title: "Anti-Farming (Win Trading)",
            desc: "É proibido duelar contra o mesmo oponente mais de 2 vezes no mesmo dia. Tentativas de 'farmar' pontos de forma combinada resultam em reset de pontos de ambos.",
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Prova da Vitória",
            desc: "Todo reporte deve conter um print legível do placar final. Prints recortados, editados ou de partidas antigas causarão o cancelamento do duelo e advertência.",
            icon: Camera,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Conduta de Honra",
            desc: "Comportamento tóxico, insultos ou falta de respeito com o oponente durante ou após o duelo não serão tolerados. Somos uma guilda, não apenas jogadores.",
            icon: Award,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            title: "Prazo de Reporte",
            desc: "As vitórias devem ser registradas no sistema em até 24 horas após o combate. Reportes tardios podem ser invalidados pelo conselho.",
            icon: Clock,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Punições Severas",
            desc: "O uso de cheats, hacks ou abuso de bugs do sistema resultará em banimento permanente e remoção imediata da guilda.",
            icon: Ban,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6">
            {/* Header Section */}
            <section className="relative p-12 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-rose-500/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Scale className="w-64 h-64" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center space-y-4"
                >
                    <Badge className="bg-rose-500 text-white uppercase tracking-widest px-4 py-1">Código de Conduta</Badge>
                    <h2 className="text-5xl font-serif tracking-[0.2em] uppercase text-glow">Leis da Arena</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto tracking-widest text-[10px] font-black uppercase opacity-60 leading-relaxed">
                        As regras garantem que a glória seja conquistada apenas por quem possui habilidade e honra.
                    </p>
                </motion.div>
            </section>

            {/* Rules List */}
            <div className="grid gap-6">
                {rules.map((rule, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-white/5 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className={`w-full md:w-24 flex items-center justify-center p-6 ${rule.bg} ${rule.color}`}>
                                    <rule.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 p-8 space-y-2">
                                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                                        {rule.title}
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {rule.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Disclaimer Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="p-8 rounded-[2rem] border border-rose-500/20 bg-rose-500/5 flex flex-col items-center text-center gap-4"
            >
                <AlertTriangle className="w-12 h-12 text-rose-500/50" />
                <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-rose-500">Jurisdição Administrativa</h4>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground max-w-md leading-relaxed">
                        O conselho administrativo reserva-se o direito de julgar casos omissos e aplicar punições discricionárias
                        para manter a integridade competitiva da Aliança.
                    </p>
                </div>
            </motion.div>

            {/* Interactive Scroll Item */}
            <div className="flex justify-center pt-8">
                <Badge variant="outline" className="opacity-30 flex items-center gap-2 py-2 px-4 border-dashed">
                    <ScrollText className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Atualizado em 27 de Fevereiro, 2026</span>
                </Badge>
            </div>
        </div>
    );
}
