import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("React Error:", error, info);

        try {
            localStorage.setItem(
                "reactError",
                JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                })
            );
        } catch (storageError) {
            console.error("Failed to persist React error:", storageError);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "grid",
                        placeItems: "center",
                        padding: "24px",
                        background:
                            "radial-gradient(circle at top, rgba(255, 240, 230, 0.9), rgba(245, 245, 245, 1))",
                        color: "#1f2937",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "640px",
                            width: "100%",
                            borderRadius: "20px",
                            background: "rgba(255, 255, 255, 0.92)",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
                            padding: "32px",
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                    >
                        <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.2 }}>
                            Something went wrong.
                        </h1>
                        <p style={{ margin: "12px 0 0", fontSize: "16px", color: "#4b5563" }}>
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;