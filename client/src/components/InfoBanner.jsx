import { Info } from "lucide-react";

const InfoBanner = ({ text, textHi, variant = "info" }) => {
    return (
        <div className={`rounded-lg px-4 py-2.5 text-sm flex items-start gap-2 ${variant === "warning"
                ? "bg-warning/10 border border-warning/20 text-warning"
                : "info-banner"
            }`}>
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
                <p>{text}</p>
                {textHi && <p className="text-xs opacity-80 mt-0.5">{textHi}</p>}
            </div>
        </div>
    );
};

export default InfoBanner;
