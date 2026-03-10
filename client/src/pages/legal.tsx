import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Scale, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

export default function Legal() {
    return (
        <div className="max-w-4xl mx-auto py-10 space-y-12">
            <motion.div {...fadeInUp} className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Conformidade Legal</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter text-glow">
                    CENTRO DE <span className="text-primary">TRANSPARÊNCIA</span>
                </h1>
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                    Sua segurança e privacidade são prioridades na Sua Partida Gamer.
                </p>
            </motion.div>

            <Tabs defaultValue="privacy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-white/5 h-14 rounded-2xl mb-8">
                    <TabsTrigger value="privacy" className="font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-primary data-[state=active]:text-black">
                        <Lock className="w-3 h-3 mr-2" /> Política de Privacidade
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-primary data-[state=active]:text-black">
                        <Scale className="w-3 h-3 mr-2" /> Termos de Uso
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="privacy">
                    <Card className="bg-card/40 border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 md:p-12 prose prose-invert max-w-none">
                            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground uppercase font-bold tracking-wide">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Eye className="w-5 h-5 text-primary" /> 1. Coleta de Informações
                                    </h2>
                                    <p>Coletamos informações básicas como seu ID de usuário do Mobile Legends para fins de ranking e personalização da sua experiência no portal Sua Partida Gamer (SPG).</p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-primary" /> 2. Uso de Cookies e Google AdSense
                                    </h2>
                                    <p>O Google, como fornecedor terceirizado, utiliza cookies para exibir anúncios no nosso site. Com o uso do cookie DART, o Google pode exibir anúncios para você com base nas suas visitas a este e a outros sites na Internet.</p>
                                    <p>Você pode desativar o uso do cookie DART visitando a Política de Privacidade da rede de conteúdo e dos anúncios do Google.</p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Info className="w-5 h-5 text-primary" /> 3. Segurança dos Dados
                                    </h2>
                                    <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado ou divulgação indevida.</p>
                                </section>

                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-[10px] text-center italic">Última atualização: Março de 2026</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="terms">
                    <Card className="bg-card/40 border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 md:p-12 prose prose-invert max-w-none">
                            <div className="space-y-8 text-sm leading-relaxed text-muted-foreground uppercase font-bold tracking-wide">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Scale className="w-5 h-5 text-primary" /> 1. Aceitação dos Termos
                                    </h2>
                                    <p>Ao acessar o portal Sua Partida Gamer, você concorda em cumprir estes termos de uso, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.</p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Gamepad2 className="w-5 h-5 text-primary" /> 2. Conduta do Usuário
                                    </h2>
                                    <p>O usuário se compromete a não utilizar a plataforma para fins fraudulentos ou abusivos, especialmente no sistema de rankings e competições organizadas pelo SPG.</p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                                        <Info className="w-5 h-5 text-primary" /> 3. Isenção de Responsabilidade
                                    </h2>
                                    <p>Os materiais no site da Sua Partida Gamer são fornecidos 'como estão'. O SPG não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as outras garantias.</p>
                                </section>

                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-[10px] text-center italic">Última atualização: Março de 2026</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Gamepad2(props: any) {
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
            <line x1="6" x2="10" y1="12" y2="12" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="15" x2="15.01" y1="13" y2="13" />
            <line x1="18" x2="18.01" y1="11" y2="11" />
            <rect width="20" height="12" x="2" y="6" rx="2" />
        </svg>
    )
}
