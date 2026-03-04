import { Player } from "@shared/schema";
import { motion } from "framer-motion";
import { Crown, Flame, Ban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
    player: Player;
    size?: "sm" | "md" | "lg" | "xl";
    showCrown?: boolean;
    showStreak?: boolean;
}

export function PlayerAvatar({ player, size = "md", showCrown = false, showStreak = true }: PlayerAvatarProps) {
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-24 h-24 md:w-32 md:h-32",
        xl: "w-32 h-32"
    };

    const frameInset = {
        sm: "-inset-1",
        md: "-inset-2",
        lg: "-inset-3",
        xl: "-inset-3"
    };

    return (
        <div className="relative group/avatar">
            {/* Glow effect for high streak or admin */}
            {player.streak >= 3 && (
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur opacity-40 animate-pulse" />
            )}

            <div className={`relative ${sizeClasses[size]} z-10`}>
                {/* Avatar Frame with "The Trick" (Blend Mode) applied automatically */}
                {player.activeFrame && (
                    player.activeFrame.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                        <div className={`absolute ${frameInset[size]} z-20 pointer-events-none flex items-center justify-center`} style={{ mixBlendMode: 'screen' }}>
                            <video
                                src={player.activeFrame}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover scale-[1.15] rounded-full"
                            />
                        </div>
                    ) : (
                        <div
                            className={`absolute ${frameInset[size]} z-20 pointer-events-none`}
                            style={{
                                backgroundImage: `url(${player.activeFrame})`,
                                backgroundSize: '115%',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                mixBlendMode: 'screen'
                            }}
                        />
                    )
                )}

                {/* Main Avatar Image */}
                <img
                    src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.accountId}&backgroundColor=b6e3f4`}
                    className={cn(
                        "w-full h-full rounded-full border-2 border-white/10 bg-[#0c1120] object-cover transition-all duration-500",
                        player.isBanned && "grayscale opacity-30"
                    )}
                    alt={player.gameName}
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.accountId}&backgroundColor=b6e3f4`;
                    }}
                />

                {/* Banned Overlay */}
                {player.isBanned && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <Ban className="w-1/2 h-1/2 text-rose-500 opacity-80" />
                    </div>
                )}

                {/* Streak Flame Overlay */}
                {showStreak && player.streak >= 3 && (
                    <div className="absolute -bottom-1 -right-1 z-30">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            filter: ["drop-shadow(0 0 2px #f97316)", "drop-shadow(0 0 8px #f97316)", "drop-shadow(0 0 2px #f97316)"]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="bg-orange-600 rounded-full p-1 border border-white/20"
                                    >
                                        <Flame className="w-3 h-3 text-white fill-current" />
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-orange-950 border-orange-500/50">
                                    <p className="text-[10px] font-black uppercase text-orange-400">{player.streak} Vitórias Seguidas!</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                {/* Rank specific deco (Crown for Rank 1) */}
                {showCrown && (
                    <Crown className="absolute -top-3 -right-3 w-6 h-6 text-yellow-500 animate-bounce drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
                )}
            </div>
        </div>
    );
}
