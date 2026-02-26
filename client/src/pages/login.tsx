import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu Nome de Usuário e ID do jogo.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(username, id);
      toast({
        title: "Arena Acessada",
        description: `Bem-vindo(a) guerreiro, ${username}!`,
      });
      setLocation("/rankings");
    } catch (error) {
      toast({
        title: "Falha na Autenticação",
        description: "Não foi possível validar suas credenciais na rede Mobile Legends.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-primary/20 bg-card/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(234,179,8,0.15)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardHeader className="text-center pb-8 pt-12 relative">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/30 relative group shadow-2xl shadow-primary/20"
            >
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            </motion.div>
            
            <CardTitle className="text-4xl font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-primary/80 uppercase">
              WMythic
            </CardTitle>
            <CardDescription className="text-sm font-medium tracking-[0.3em] uppercase text-primary/60 mt-2">
              Alliance Arena 1v1
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 ml-1">Assinatura de Batalha</Label>
                <div className="relative group">
                  <Input
                    id="username"
                    placeholder="Nome no Jogo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-primary/10 focus-visible:ring-primary h-14 text-lg pl-6 transition-all group-hover:border-primary/30"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="id" className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 ml-1">Identificador de Soldado (ID)</Label>
                <div className="relative group">
                  <Input
                    id="id"
                    placeholder="ID da Conta"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="bg-white/5 border-primary/10 focus-visible:ring-primary h-14 text-lg pl-6 font-mono transition-all group-hover:border-primary/30"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center tracking-wider italic">
                  Sincronizado com Ridwaanhall Mobile Legends API
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-yellow-400 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)] transition-all active:scale-95 mt-6 relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Reivindicar Lugar no Rank
                    <Swords className="w-5 h-5 ml-3" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
