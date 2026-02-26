import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Swords, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        title: "Login efetuado com sucesso",
        description: `Bem-vindo(a), ${username}!`,
      });
      setLocation("/rankings");
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Não foi possível validar seus dados no momento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-0" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />

      <Card className="w-full max-w-md relative z-10 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/30 relative">
            <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20" />
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 uppercase tracking-widest">
            WMythic Alliance
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-muted-foreground">
            Sistema Oficial de Ranking 1v1
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-primary/80 uppercase tracking-wider text-xs font-bold">Nome do Personagem</Label>
              <Input
                id="username"
                placeholder="Ex: sempaigam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id" className="text-primary/80 uppercase tracking-wider text-xs font-bold">ID do Usuário</Label>
              <Input
                id="id"
                placeholder="Ex: 1792001576"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary h-12 text-lg font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Conectado com a API Mobile Legends para validação
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-yellow-400 text-primary-foreground shadow-lg shadow-primary/25 transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  Entrar na Arena
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
            Acesso administrativo: use <strong className="text-primary">sempaigam</strong> / <strong className="text-primary">1792001576</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
