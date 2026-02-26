import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { LogOut, Trophy, ShieldAlert, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

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
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 uppercase tracking-wider hidden sm:block">
              WMythic Alliance
            </h1>
            <h1 className="text-xl font-bold text-primary sm:hidden">WMA</h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link href="/rankings">
              <Button variant="ghost" className={`font-medium ${location === '/rankings' ? 'text-primary' : 'text-muted-foreground'}`}>
                Ranking
              </Button>
            </Link>
            
            {user.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className={`font-medium ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Admin</span>
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
