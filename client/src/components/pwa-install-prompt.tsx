import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function PwaInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
            // Show the custom install UI
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if it's iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            // Show iOS specific message after a short delay
            const timer = setTimeout(() => {
                toast({
                    title: "Instale o App no iOS",
                    description: "Toque no ícone de compartilhar e depois em 'Adicionar à Tela de Início' para uma melhor experiência.",
                    duration: 10000,
                });
            }, 5000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [toast]);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-80"
            >
                <div className="bg-card border border-primary/20 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 bg-opacity-95 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Instalar Aplicativo</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">Tenha acesso rápido à arena!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleInstallClick} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4">
                            Instalar
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsVisible(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
