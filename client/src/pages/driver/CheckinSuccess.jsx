import { CheckCircle } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const CheckinSuccess = () => {
    const details = [
        { label: "REFID", value: "RF-9988" },
        { label: "ZGP", value: "ZGP-100200" },
        { label: "Vehicle / वाहन", value: "MH 04 AB 1234" },
        { label: "DO Number / डीओ नंबर", value: "DO-784512" },
        { label: "Token Number / टोकन नंबर", value: "25" },
    ];

    return (
        <div className="mobile-container">
            <AppHeader />

            <div className="page-content flex flex-col items-center justify-center flex-1">

                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "hsl(var(--success) / 0.15)" }}
                >
                    <CheckCircle
                        className="w-12 h-12"
                        style={{ color: "hsl(var(--success))" }}
                    />
                </div>

                <h1
                    className="text-2xl font-bold"
                    style={{ color: "hsl(var(--foreground))" }}
                >
                    Reporting Successful!
                </h1>

                <p
                    className="text-sm mb-6"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                >
                    रिपोर्टिंग सफल रही!
                </p>

                <div
                    className="rounded-2xl w-full overflow-hidden shadow-sm"
                    style={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                    }}
                >
                    <div
                        className="px-6 py-5 text-center border-b"
                        style={{
                            background: "hsl(var(--primary) / 0.05)",
                            borderColor: "hsl(var(--border))",
                        }}
                    >
                        <span
                            className="text-5xl font-bold"
                            style={{ color: "hsl(var(--primary))" }}
                        >
                            #24
                        </span>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                            Waiting Number / प्रतीक्षा क्रमांक
                        </p>
                    </div>

                    <div className="px-6 py-4 space-y-3">
                        {details.map((item) => (
                            <div key={item.label} className="flex justify-between">
                                <span
                                    className="text-sm"
                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                >
                                    {item.label}
                                </span>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: "hsl(var(--foreground))" }}
                                >
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="mt-6 rounded-xl px-5 py-3 text-center w-full"
                    style={{
                        background: "hsl(var(--success) / 0.1)",
                        border: "1px solid hsl(var(--success) / 0.2)",
                    }}
                >
                    <p style={{ color: "hsl(var(--success))" }} className="font-semibold">
                        Please go to Gate No. 1
                    </p>
                    <p
                        className="text-xs"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                        कृपया गेट नंबर 1 पर जाएं
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckinSuccess;
