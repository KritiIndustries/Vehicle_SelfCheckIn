import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useState } from "react"

export default function LocationPermission({ onAllow, onDeny }) {
    const [mode, setMode] = useState("precise")

    return (
        <div className="fixed inset-0  flex items-center justify-center p-4">
            <Card className="w-full max-w-sm rounded-2xl shadow-xl">
                <CardContent className="p-6 space-y-6">

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-center">
                        Allow to access this device location?
                    </h2>

                    {/* Location Type Selection */}
                    <div className="flex justify-between gap-4">

                        {/* Precise */}
                        <div
                            onClick={() => setMode("precise")}
                            className={`flex-1 cursor-pointer rounded-xl border p-4 text-center transition
                ${mode === "precise"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <MapPin className="mx-auto mb-2 w-8 h-8 text-blue-600" />
                            <p className="font-medium">Precise</p>
                            <p className="text-xs text-muted-foreground">सटीक</p>
                        </div>

                        {/* Approximate */}
                        <div
                            onClick={() => setMode("approximate")}
                            className={`flex-1 cursor-pointer rounded-xl border p-4 text-center transition
                ${mode === "approximate"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <MapPin className="mx-auto mb-2 w-8 h-8 text-gray-600" />
                            <p className="font-medium">Approximate</p>
                            <p className="text-xs text-muted-foreground">अनुमानित</p>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">

                        <Button
                            className="w-full"
                            onClick={() => onAllow?.(mode)}
                        >
                            While using the app
                            <div className="text-xs block">ऐप का उपयोग करते समय</div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onAllow?.(mode)}
                        >
                            Only this time
                            <div className="text-xs block">बस इस बार</div>
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-destructive"
                            onClick={onDeny}
                        >
                            Don't allow
                            <div className="text-xs block">अनुमति न दें</div>
                        </Button>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
