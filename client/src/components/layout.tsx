import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { LogOut, Trophy, ShieldAlert, User as UserIcon, BookOpen, MessageSquare, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["/api/chat/conversations"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">Sincronizando com a Partida...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-8 h-8 object-contain" alt="SPG Logo" />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 uppercase tracking-wider hidden sm:block">
              SUA PARTIDA GAMER
            </h1>
            <h1 className="text-xl font-bold text-primary sm:hidden">SPG</h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar max-w-full pb-1">
            <Link href="/rankings">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/rankings' ? 'text-primary' : 'text-muted-foreground'}`}>
                Arena
              </Button>
            </Link>

            <Link href="/arcade">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/arcade' ? 'text-primary' : 'text-orange-400 hover:text-orange-300'}`}>
                <Gamepad2 className="w-3 h-3 mr-1" />
                Arcade
              </Button>
            </Link>


            <Link href="/rules">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/rules' ? 'text-primary' : 'text-muted-foreground'}`}>
                Regras
              </Button>
            </Link>

            <Link href="/chat">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/chat' ? 'text-primary' : 'text-muted-foreground'}`}>
                Chat Global
              </Button>
            </Link>

            <Link href="/chat/private">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 relative ${location.startsWith('/chat/private') ? 'text-primary' : 'text-muted-foreground'}`}>
                <MessageSquare className="w-3 h-3 mr-1" />
                Privado
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]">
                    {totalUnread}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/guide">
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/guide' ? 'text-primary' : 'text-emerald-400 hover:text-emerald-300'}`}>
                <BookOpen className="w-3 h-3 mr-1" />
                Guia
              </Button>
            </Link>

            <Link href={`/player/${user.id}/${user.zoneId}`}>
              <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location.includes('/player/') ? 'text-primary' : 'text-muted-foreground'}`}>
                Meu Perfil
              </Button>
            </Link>

            {user.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className={`font-black uppercase tracking-widest text-[11px] h-8 ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Admin
                </Button>
              </Link>
            )}

            <div className="h-6 w-px bg-border mx-2" />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold leading-none">{user.username}</span>
                <span className="text-xs text-primary">{user.rank}</span>
              </div>
              <Button variant="outline" size="icon" onClick={handleLogout} className="border-border/50 hover:bg-destructive/20 hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl py-12 px-4 relative z-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="w-10 h-10 object-contain" alt="SPG Logo" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-widest font-serif">SPG <span className="text-primary italic">PORTAL</span></span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Sua Partida Gamer © 2026</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest leading-loose opacity-60">
              O maior ecossistema de ranking 1v1 oficial do Mobile Legends no Brasil. Competitividade levada a sério.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Plataforma</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/rankings" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Arena de Luta</Link>
              <Link href="/arcade" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Game Center (Arcade)</Link>
              <Link href="/rules" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Regras Oficiais</Link>
              <Link href="/chat" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Comunidade</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Suporte & Legal</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/guide" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Guia do Jogador</Link>
              <Link href="/legal" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Política de Privacidade</Link>
              <Link href="/legal" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Termos de Uso</Link>
              <a href="mailto:contato@suapartidagamer.com.br" className="text-xs text-muted-foreground hover:text-white uppercase font-black tracking-widest transition-colors">Fale Conosco</a>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="https://instagram.com/suapartidagamer" target="_blank" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="https://youtube.com/@suapartidagamer" target="_blank" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
            <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Powered by <span className="text-white">SPG Core Engine</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
