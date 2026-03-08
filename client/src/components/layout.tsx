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
    </div>
  );
}
