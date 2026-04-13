// import React from "react";
// import { Camera, Upload, Image } from "lucide-react";

// export default function PickerSheet({ show, onClose, onPick }) {
//     if (!show) return null;

//     const handlePick = (type) => {
//         if (onPick) onPick(type);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-end justify-center">
//             <div
//                 className="absolute inset-0"
//                 style={{ background: "hsl(var(--foreground) / 0.4)" }}
//                 onClick={onClose}
//             />

//             <div
//                 className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-[slideUp_0.25s_ease-out]"
//                 style={{ background: "hsl(var(--card))" }}
//             >
//                 <h3 className="text-lg font-semibold text-center mb-1" style={{ color: "hsl(var(--foreground))" }}>
//                     Select Option / विकल्प चुनें
//                 </h3>

//                 <div className="grid grid-cols-3 gap-4 mt-5">
//                     <button onClick={() => handlePick("camera")} className="flex flex-col items-center gap-2">
//                         <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
//                             <Camera className="w-6 h-6" />
//                         </div>
//                         <span className="text-xs">Take Photo</span>
//                     </button>

//                     <button onClick={() => handlePick("pdf")} className="flex flex-col items-center gap-2">
//                         <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
//                             <Upload className="w-6 h-6" />
//                         </div>
//                         <span className="text-xs">Upload PDF</span>
//                     </button>

//                     <button onClick={() => handlePick("gallery")} className="flex flex-col items-center gap-2">
//                         <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted">
//                             <Image className="w-6 h-6" />
//                         </div>
//                         <span className="text-xs">Gallery</span>
//                     </button>
//                 </div>

//                 <button
//                     onClick={onClose}
//                     className="w-full text-center text-sm font-medium mt-6"
//                     style={{ color: "hsl(var(--destructive))" }}
//                 >
//                     Cancel / रद्द करें
//                 </button>
//             </div>
//         </div>
//     );
// }

import React from "react";
import { Camera, Upload } from "lucide-react";

export default function PickerSheet({ show, onClose, onPick }) {
    if (!show) return null;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const handlePick = (type) => {
        if (onPick) onPick(type);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
                className="absolute inset-0"
                style={{ background: "hsl(var(--foreground) / 0.4)" }}
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl bg-white">
                <h3 className="text-lg font-semibold text-center mb-3">
                    Select Option
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* 📱 Mobile → Camera */}
                    {isMobile && (
                        <button
                            onClick={() => handlePick("camera")}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
                                <Camera className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Take Photo</span>
                        </button>
                    )}

                    {/* 💻 Desktop → Upload */}
                    {!isMobile && (
                        <button
                            onClick={() => handlePick("upload")}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
                                <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-xs">Upload Image</span>
                        </button>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 text-sm text-red-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
