

// const AppHeader = ({ showAudio = true }) => {
//     return (
//         <header className="flex items-center justify-between px-5 py-3 bg-card border-b border-border">
//             <div className="flex items-center gap-2">
//                 <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
//                     <span className="text-primary-foreground font-bold text-xs">KP</span>
//                 </div>
//                 <span className="font-bold text-sm text-foreground">Kasta Plant</span>
//             </div>
//             {showAudio && (
//                 <div className="flex items-center gap-3">
//                     <span className="text-xs text-muted-foreground">Replay Audio</span>
//                     <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
//                         <Volume2 className="w-4 h-4 text-muted-foreground" />
//                     </button>
//                 </div>
//             )}
//         </header>
//     );
// };
import { Volume2, VolumeX } from "lucide-react";

const AppHeader = ({ showAudio = true, audioEnabled, onToggleAudio }) => {
    return (
        <header
            className="flex items-center justify-between px-5 py-3"
            style={{
                background: "hsl(var(--card))",
                borderBottom: "1px solid hsl(var(--border))",
            }}
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "hsl(var(--primary))" }}
                >
                    <span
                        className="text-xs font-bold"
                        style={{ color: "hsl(var(--primary-foreground))" }}
                    >
                        KP
                    </span>
                </div>

                <span
                    className="font-bold text-sm"
                    style={{ color: "hsl(var(--foreground))" }}
                >
                    Kasta Plant
                </span>
            </div>

            {showAudio && (
                <button
                    onClick={onToggleAudio}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "hsl(var(--muted))" }}
                >
                    {audioEnabled ? (
                        <Volume2 className="w-4 h-4" />
                    ) : (
                        <VolumeX className="w-4 h-4" />
                    )}
                </button>
            )}
        </header>
    );
};



export default AppHeader;
