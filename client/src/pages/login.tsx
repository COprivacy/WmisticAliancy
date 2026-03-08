import { useState, useEffect } from "react";
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
  const [pin, setPin] = useState("");
  const [loginStep, setLoginStep] = useState<"initial" | "pin_entry" | "pin_setup">("initial");

  const { user, login, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user && location === "/") {
      setLocation("/rankings");
    }
  }, [user, location, setLocation]);
  const { toast } = useToast();
  const [mlbbInfo, setMlbbInfo] = useState<{ name: string; rank: string; avatarImage: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  // true when MLBB API timed out or failed — user can still proceed without verification
  const [mlbbApiReady, setMlbbApiReady] = useState(false);

  const registrationMutation = useMutation({
    mutationFn: async (data: { gameName: string; accountId: string; zoneId: string; avatar?: string; currentRank?: string; pin: string }) => {
      const res = await apiRequest("POST", "/api/players", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "🗡️ Registro Concluído",
        description: "Bem-vindo ao SUA PARTIDA GAMER.",
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
    setLoginStep("initial");
    setPin("");
    setMlbbApiReady(false);

    if (idVal.length >= 8 && zoneVal.length >= 4) {
      setIsValidating(true);
      const controller = new AbortController();
      // 5 second timeout — if MLBB API is down, user can still login
      const timeout = setTimeout(() => {
        controller.abort();
        setIsValidating(false);
        setMlbbApiReady(true); // unlock button even without MLBB data
        toast({
          title: "API MLBB indisponível",
          description: "Validação de nome desativada temporariamente. Você ainda pode entrar.",
        });
      }, 5000);
      try {
        const res = await fetch(`/api/mlbb/account/${idVal}/${zoneVal}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          setMlbbInfo(data);
          setUsername(data.name);
        }
        setMlbbApiReady(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          clearTimeout(timeout);
          setMlbbApiReady(true); // API error — still allow login
        }
      } finally {
        setIsValidating(false);
      }
    } else {
      setMlbbInfo(null);
      setMlbbApiReady(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      // First attempt to login (this checks if account exists and status)
      const loginRes = await login(username || `Soldado_${id.slice(-4)}`, id, zone, pin);

      if (loginRes.status === "needs_pin") {
        setLoginStep("pin_entry");
        toast({ title: "PIN Necessário", description: "Sua conta é protegida. Digite seu PIN." });
        return;
      }

      if (loginRes.status === "needs_setup_pin") {
        setLoginStep("pin_setup");
        toast({ title: "Segurança Ativada", description: "Cadastre um PIN para proteger sua conta." });
        return;
      }

      if (loginRes.id) {
        // Successful login
        setLocation("/rankings");
      }
    } catch (error: any) {
      // If error is 404 (conceptually, if registration is needed)
      // or if login failed because player doesn't exist
      if (loginStep === "initial") {
        setLoginStep("pin_setup");
        toast({ title: "Primeiro Acesso", description: "Defina seu PIN de segurança." });
        return;
      }

      // If we are in setup and have a PIN, register
      if (loginStep === "pin_setup" && pin.length >= 4) {
        try {
          await registrationMutation.mutateAsync({
            gameName: username || `Soldado_${id.slice(-4)}`,
            accountId: id,
            zoneId: zone,
            avatar: mlbbInfo?.avatarImage,
            currentRank: mlbbInfo?.rank,
            pin: pin
          });

          await login(username || `Soldado_${id.slice(-4)}`, id, zone, pin);
          setLocation("/rankings");
        } catch (regErr) {
          toast({ title: "Erro no Registro", description: "Não foi possível criar sua conta.", variant: "destructive" });
        }
      } else {
        toast({ title: "Falha na Arena", description: error.message || "Erro desconhecido", variant: "destructive" });
      }
    }
  };

  const ADMIN_ID = "1792001576";
  const isAdminAccount = id === ADMIN_ID;
  const isPending = authLoading || registrationMutation.isPending;

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 shadow-2xl shadow-primary/20">
          <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-[0.3em] text-primary/50 font-bold">Iniciando Partida...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Cinematic Hero Background */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'url("/images/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5) saturate(1.2)'
        }}
      />

      {/* Glossy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] z-0" />

      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse delay-700 z-0" />

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

          <CardHeader className="text-center pb-8 pt-10 relative">
            <motion.div
              initial={{ y: 0 }}
              animate={{
                y: [0, -10, 0],
                filter: ["drop-shadow(0 0 10px rgba(234,179,8,0.2))", "drop-shadow(0 0 25px rgba(234,179,8,0.5))", "drop-shadow(0 0 10px rgba(234,179,8,0.2))"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-auto w-48 h-48 flex items-center justify-center mb-6 relative group"
            >
              {/* Decorative elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-primary/10 scale-125 opacity-20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-primary/5 scale-110 opacity-30"
              />

              <img
                src="/login-brand.png"
                className="w-full h-full object-contain relative z-10"
                alt="SUA PARTIDA GAMER"
              />
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-500 animate-pulse drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
            </motion.div>

            <div className="space-y-1">
              <CardTitle className="text-4xl font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-primary/80 uppercase">
                SUA PARTIDA
              </CardTitle>
              <CardDescription className="text-sm font-black tracking-[0.4em] uppercase text-primary/60">
                GAMER - Rank 1v1
              </CardDescription>
            </div>
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
                      readOnly={loginStep !== "initial"}
                      onChange={(e) => validateAccount(e.target.value.replace(/\s/g, ""), zone)}
                      className={`bg-white/5 border-primary/20 focus-visible:ring-primary h-14 text-center text-lg font-mono transition-all group-hover:border-primary/40 rounded-xl ${loginStep !== "initial" ? "opacity-50" : ""}`}
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
                      readOnly={loginStep !== "initial"}
                      onChange={(e) => validateAccount(id, e.target.value.replace(/\s/g, ""))}
                      className={`bg-white/5 border-primary/20 focus-visible:ring-primary h-14 text-center text-lg font-mono transition-all group-hover:border-primary/40 rounded-xl ${loginStep !== "initial" ? "opacity-50" : ""}`}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loginStep === "initial" && (
                  <motion.div
                    key="initial-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {mlbbInfo && (
                      <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                        <div className="relative">
                          <img src={mlbbInfo.avatarImage} className="w-16 h-16 rounded-full border-2 border-primary shadow-lg shadow-primary/20" />
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 rounded-sm">MLBB</div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-serif uppercase tracking-widest">{mlbbInfo.name}</p>
                          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{mlbbInfo.rank}</Badge>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {(loginStep === "pin_entry" || loginStep === "pin_setup") && (
                  <motion.div
                    key="pin-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {loginStep === "pin_setup" && (
                      <div className="space-y-3">
                        <Label htmlFor="username" className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Nickname na Guilda</Label>
                        <Input
                          id="username"
                          placeholder="Como quer ser chamado?"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-primary/5 border-primary/30 h-14 rounded-2xl text-lg font-bold tracking-wide"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="pin" className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                          {loginStep === "pin_setup" ? "Cadastrar PIN de Segurança" : "Digitar seu PIN"}
                        </Label>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">4-6 DÍGITOS</span>
                      </div>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="••••••"
                        value={pin}
                        autoFocus
                        maxLength={6}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        className="bg-white/5 border-primary text-primary h-20 text-center text-4xl tracking-[0.5em] font-black rounded-2xl"
                      />
                      <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                        {loginStep === "pin_setup"
                          ? "Não esqueça este código! Ele é sua chave de acesso."
                          : "Proteja sua conta. Não compartilhe seu PIN."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-yellow-400 shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)] transition-all active:scale-95 relative overflow-hidden group"
                  disabled={
                    isPending ||
                    isValidating ||
                    (loginStep === "initial" && !mlbbInfo && !isAdminAccount && !mlbbApiReady) ||
                    (loginStep !== "initial" && pin.length < 4)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      {loginStep === "initial" ? "Validar Identidade" :
                        loginStep === "pin_setup" ? "Cadastrar e Entrar" : "Acessar Arena"}
                      <Swords className="w-5 h-5 ml-3" />
                    </span>
                  )}
                </Button>

                {loginStep !== "initial" && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[10px] uppercase font-bold tracking-widest opacity-50 hover:opacity-100"
                    onClick={() => {
                      setLoginStep("initial");
                      setPin("");
                    }}
                  >
                    Voltar / Trocar ID
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

