import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";


export default function Login() {
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [zone, setZone] = useState("");
  const { login, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mlbbInfo, setMlbbInfo] = useState<{ name: string; rank: string; avatarImage: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);



  const registrationMutation = useMutation({
    mutationFn: async (data: { gameName: string; accountId: string; zoneId: string; avatar?: string; currentRank?: string }) => {
      const res = await apiRequest("POST", "/api/players", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "🗡️ Registro Concluído",
        description: "Bem-vindo à Arena WMythic.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("já registrado")) return;
      toast({ title: "Erro no Registro", variant: "destructive" });
    }
  });

  const validateAccount = async (idVal: string, zoneVal: string) => {
    setId(idVal);
    setZone(zoneVal);

    if (idVal.length >= 8 && zoneVal.length >= 4) {
      setIsValidating(true);
      try {
        const res = await fetch(`/api/mlbb/account/${idVal}/${zoneVal}`);
        if (res.ok) {
          const data = await res.json();
          setMlbbInfo(data);
          setUsername(data.name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsValidating(false);
      }
    } else {
      setMlbbInfo(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await registrationMutation.mutateAsync({
        gameName: username || `Soldado_${id.slice(-4)}`,
        accountId: id,
        zoneId: zone,
        avatar: mlbbInfo?.avatarImage,
        currentRank: mlbbInfo?.rank
      });

      await login(username || `Soldado_${id.slice(-4)}`, id, zone);
      setLocation("/rankings");
    } catch (error) {
      // Re-try login directly if registration failed but record might exist
      try {
        await login(username, id, zone);
        setLocation("/rankings");
      } catch (e) {
        toast({ title: "Falha na Arena", variant: "destructive" });
      }
    }
  };

  const isPending = authLoading || registrationMutation.isPending;

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
                <Label htmlFor="id" className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 ml-1 text-center block">
                  Identificador de Batalha (ID e Zona)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3 relative group">
                    <Input
                      id="id"
                      placeholder="ID: 1792001576"
                      value={id}
                      onChange={(e) => validateAccount(e.target.value, zone)}
                      className="bg-white/5 border-primary/20 focus-visible:ring-primary h-14 text-center text-lg font-mono transition-all group-hover:border-primary/40 rounded-xl"
                    />
                    {isValidating && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <Input
                      id="zone"
                      placeholder="2888"
                      value={zone}
                      onChange={(e) => validateAccount(id, e.target.value)}
                      className="bg-white/5 border-primary/20 focus-visible:ring-primary h-14 text-center text-lg font-mono transition-all group-hover:border-primary/40 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {mlbbInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <div className="relative">
                      <img src={mlbbInfo.avatarImage} className="w-16 h-16 rounded-full border-2 border-primary shadow-lg shadow-primary/20" />
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 rounded-sm">
                        MLBB
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-serif uppercase tracking-widest">{mlbbInfo.name}</p>
                      <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{mlbbInfo.rank}</Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 ml-1">Nickname na Guilda</Label>
                <Input
                  id="username"
                  placeholder="Nome de Batalha"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-primary/10 h-12 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-yellow-400 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)] transition-all active:scale-95 mt-6 relative overflow-hidden group"
                disabled={isPending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {isPending ? (
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

