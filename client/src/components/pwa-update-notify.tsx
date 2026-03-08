import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, X, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PwaUpdateNotify() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needUpdate: [needUpdate, setNeedUpdate],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error: any) {
            console.error('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedUpdate(false);
    };

    return (
        <AnimatePresence>
            {(offlineReady || needUpdate) && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-96"
                >
                    <div className="relative overflow-hidden bg-[#020617]/95 border border-primary/30 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl group">
                        {/* Background Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                                        <Zap className="w-6 h-6 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black uppercase tracking-widest text-white leading-tight">
                                            {needUpdate ? "Expansão de Conteúdo!" : "Arena Pronta!"}
                                        </h4>
                                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                                            {needUpdate
                                                ? "Novas melhorias foram forjadas para sua jornada."
                                                : "O portal agora funciona totalmente offline."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={close}
                                    className="p-1 text-white/20 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wide opacity-80">
                                {needUpdate
                                    ? "Recomendamos atualizar agora para receber as últimas otimizações de performance e recursos visuais."
                                    : "Acesse a Arena SPG de qualquer lugar, mesmo sem sinal."}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                                {needUpdate ? (
                                    <Button
                                        onClick={() => updateServiceWorker(true)}
                                        className="flex-1 h-12 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Atualizar Agora
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={close}
                                        className="flex-1 h-12 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10"
                                    >
                                        Entendido
                                    </Button>
                                )}
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 border border-primary/10">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
