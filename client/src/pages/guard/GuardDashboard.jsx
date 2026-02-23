// import { useState } from "react";
// import { Truck, Clock, CheckCircle, XCircle, LogOut, Eye, ChevronRight } from "lucide-react";
// import AppHeader from "@/components/AppHeader";

// const mockVehicles = [
//     { id: "1", token: 24, vehicleNo: "MH 04 AB 1234", driverName: "Rajesh Kumar", doNumber: "DO-784512", rfid: "RF-9988", status: "waiting" },
//     { id: "2", token: 25, vehicleNo: "MP 09 CD 5678", driverName: "Suresh Yadav", doNumber: "DO-784513", rfid: "RF-9989", status: "waiting" },
//     { id: "3", token: 23, vehicleNo: "RJ 14 EF 9012", driverName: "Anil Sharma", doNumber: "DO-784510", rfid: "RF-9987", status: "inside", entryTime: "10:30 AM" },
//     { id: "4", token: 22, vehicleNo: "GJ 05 GH 3456", driverName: "Vikram Singh", doNumber: "DO-784509", rfid: "RF-9986", status: "loading", entryTime: "09:45 AM" },
// ];

// const statusConfig = {
//     waiting: { label: "Waiting", class: "status-waiting", icon: Clock },
//     "checked-in": { label: "Checked In", class: "status-checked-in", icon: CheckCircle },
//     inside: { label: "Inside", class: "status-inside", icon: Truck },
//     loading: { label: "Loading", class: "status-inside", icon: Truck },
//     completed: { label: "Completed", class: "status-checked-in", icon: CheckCircle },
// };

// const GuardDashboard = () => {
//     const [vehicles, setVehicles] = useState(mockVehicles);
//     const [selectedVehicle, setSelectedVehicle] = useState(null);
//     const [activeTab, setActiveTab] = useState("queue");
//     const [rejectRemark, setRejectRemark] = useState("");
//     const [showRejectModal, setShowRejectModal] = useState(false);

//     const queueVehicles = vehicles.filter((v) => v.status === "waiting" || v.status === "checked-in");
//     const insideVehicles = vehicles.filter((v) => v.status === "inside" || v.status === "loading");

//     const handleCheckIn = (id) => {
//         setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status: "inside", entryTime: new Date().toLocaleTimeString() } : v));
//         setSelectedVehicle(null);
//     };

//     const handleCheckOut = (id) => {
//         setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status: "completed" } : v));
//         setSelectedVehicle(null);
//     };

//     const handleReject = (id) => {
//         if (!rejectRemark) return;
//         setVehicles((prev) => prev.filter((v) => v.id !== id));
//         setShowRejectModal(false);
//         setSelectedVehicle(null);
//         setRejectRemark("");
//     };

//     const displayed = activeTab === "queue" ? queueVehicles : insideVehicles;

//     return (
//         <div className="mobile-container">
//             <AppHeader showAudio={false} />
//             <div className="px-5 pt-4 pb-2">
//                 <h1 className="text-xl font-bold text-foreground">Guard Dashboard</h1>
//                 <p className="text-sm text-muted-foreground">गार्ड डैशबोर्ड</p>
//             </div>

//             <div className="grid grid-cols-3 gap-3 px-5 mb-4">
//                 <div className="bg-warning/10 rounded-xl p-3 text-center">
//                     <span className="text-2xl font-bold text-warning">{queueVehicles.length}</span>
//                     <p className="text-xs text-muted-foreground mt-1">Queue</p>
//                 </div>
//                 <div className="bg-success/10 rounded-xl p-3 text-center">
//                     <span className="text-2xl font-bold text-success">{insideVehicles.length}</span>
//                     <p className="text-xs text-muted-foreground mt-1">Inside</p>
//                 </div>
//                 <div className="bg-accent/10 rounded-xl p-3 text-center">
//                     <span className="text-2xl font-bold text-accent">
//                         {vehicles.filter((v) => v.status === "completed").length}
//                     </span>
//                     <p className="text-xs text-muted-foreground mt-1">Done</p>
//                 </div>
//             </div>

//             <div className="flex px-5 gap-2 mb-3">
//                 <button
//                     onClick={() => setActiveTab("queue")}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "queue" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
//                         }`}
//                 >
//                     Queue ({queueVehicles.length})
//                 </button>
//                 <button
//                     onClick={() => setActiveTab("inside")}
//                     className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "inside" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
//                         }`}
//                 >
//                     Inside ({insideVehicles.length})
//                 </button>
//             </div>

//             <div className="px-5 space-y-3 pb-6 overflow-auto flex-1">
//                 {displayed.map((v) => {
//                     const sc = statusConfig[v.status];
//                     return (
//                         <button
//                             key={v.id}
//                             onClick={() => setSelectedVehicle(v)}
//                             className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all"
//                         >
//                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
//                                 <span className="text-sm font-bold text-primary">#{v.token}</span>
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-semibold text-foreground truncate">{v.vehicleNo}</p>
//                                 <p className="text-xs text-muted-foreground">{v.driverName}</p>
//                             </div>
//                             <span className={`status-badge ${sc.class}`}>{sc.label}</span>
//                             <ChevronRight className="w-4 h-4 text-muted-foreground" />
//                         </button>
//                     );
//                 })}
//                 {displayed.length === 0 && (
//                     <div className="text-center py-12 text-muted-foreground">
//                         <p className="text-sm">No vehicles in this category</p>
//                     </div>
//                 )}
//             </div>

//             {selectedVehicle && (
//                 <div className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center">
//                     <div className="bg-card w-full max-w-md rounded-t-2xl max-h-[80vh] overflow-auto">
//                         <div className="p-6">
//                             <div className="flex justify-between items-start mb-4">
//                                 <div>
//                                     <h2 className="text-lg font-bold text-foreground">{selectedVehicle.vehicleNo}</h2>
//                                     <p className="text-sm text-muted-foreground">{selectedVehicle.driverName}</p>
//                                 </div>
//                                 <button onClick={() => setSelectedVehicle(null)} className="text-muted-foreground text-xl">✕</button>
//                             </div>

//                             <div className="space-y-3 mb-6">
//                                 {[
//                                     { label: "Token", value: `#${selectedVehicle.token}` },
//                                     { label: "DO Number", value: selectedVehicle.doNumber },
//                                     { label: "RFID", value: selectedVehicle.rfid },
//                                     { label: "Status", value: statusConfig[selectedVehicle.status].label },
//                                     ...(selectedVehicle.entryTime ? [{ label: "Entry Time", value: selectedVehicle.entryTime }] : []),
//                                 ].map((item) => (
//                                     <div key={item.label} className="flex justify-between py-2 border-b border-border">
//                                         <span className="text-sm text-muted-foreground">{item.label}</span>
//                                         <span className="text-sm font-semibold text-foreground">{item.value}</span>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="space-y-3">
//                                 {selectedVehicle.status === "waiting" && (
//                                     <>
//                                         <button onClick={() => handleCheckIn(selectedVehicle.id)} className="btn-primary-full">
//                                             <CheckCircle className="w-4 h-4" /> Approve Entry / प्रवेश स्वीकृत
//                                         </button>
//                                         <button onClick={() => setShowRejectModal(true)} className="w-full bg-destructive text-destructive-foreground py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2">
//                                             <XCircle className="w-4 h-4" /> Reject / अस्वीकार
//                                         </button>
//                                     </>
//                                 )}
//                                 {(selectedVehicle.status === "inside" || selectedVehicle.status === "loading") && (
//                                     <button onClick={() => handleCheckOut(selectedVehicle.id)} className="btn-primary-full">
//                                         <LogOut className="w-4 h-4" /> Check Out / चेक आउट
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showRejectModal && selectedVehicle && (
//                 <div className="fixed inset-0 bg-foreground/60 z-[60] flex items-center justify-center p-5">
//                     <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
//                         <h3 className="text-lg font-bold text-foreground mb-1">Reject Vehicle</h3>
//                         <p className="text-sm text-muted-foreground mb-4">Please provide a reason / कृपया कारण दें</p>
//                         <textarea
//                             value={rejectRemark}
//                             onChange={(e) => setRejectRemark(e.target.value)}
//                             placeholder="Enter reason for rejection..."
//                             className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
//                         />
//                         <div className="flex gap-3 mt-4">
//                             <button onClick={() => { setShowRejectModal(false); setRejectRemark(""); }} className="flex-1 btn-outline-primary">
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => handleReject(selectedVehicle.id)}
//                                 disabled={!rejectRemark}
//                                 className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-xl font-semibold disabled:opacity-50"
//                             >
//                                 Confirm Reject
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GuardDashboard;


import { useState } from "react";
import {
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const mockVehicles = [
    { id: "1", token: 24, vehicleNo: "MH 04 AB 1234", driverName: "Rajesh Kumar", doNumber: "DO-784512", rfid: "RF-9988", status: "waiting" },
    { id: "2", token: 25, vehicleNo: "MP 09 CD 5678", driverName: "Suresh Yadav", doNumber: "DO-784513", rfid: "RF-9989", status: "waiting" },
    { id: "3", token: 23, vehicleNo: "RJ 14 EF 9012", driverName: "Anil Sharma", doNumber: "DO-784510", rfid: "RF-9987", status: "inside", entryTime: "10:30 AM" },
    { id: "4", token: 22, vehicleNo: "GJ 05 GH 3456", driverName: "Vikram Singh", doNumber: "DO-784509", rfid: "RF-9986", status: "loading", entryTime: "09:45 AM" },
];



export default function GuardDashboard() {
    const [vehicles, setVehicles] = useState(mockVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState("queue");
    const [rejectRemark, setRejectRemark] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    const queueVehicles = vehicles.filter(
        (v) => v.status === "waiting"
    );
    const insideVehicles = vehicles.filter(
        (v) => v.status === "inside" || v.status === "loading"
    );

    const handleCheckIn = (id) => {
        setVehicles((prev) =>
            prev.map((v) =>
                v.id === id
                    ? { ...v, status: "inside", entryTime: new Date().toLocaleTimeString() }
                    : v
            )
        );
        setSelectedVehicle(null);
    };

    const handleCheckOut = (id) => {
        setVehicles((prev) =>
            prev.map((v) =>
                v.id === id ? { ...v, status: "completed" } : v
            )
        );
        setSelectedVehicle(null);
    };

    const handleReject = (id) => {
        if (!rejectRemark) return;
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        setRejectRemark("");
        setShowRejectModal(false);
        setSelectedVehicle(null);
    };

    const displayed = activeTab === "queue" ? queueVehicles : insideVehicles;

    return (
        <div className="mobile-container">
            <AppHeader showAudio={false} />

            {/* HEADER */}
            <div className="px-5 pt-4 pb-2">
                <h1
                    className="text-xl font-bold"
                    style={{ color: "hsl(var(--foreground))" }}
                >
                    Guard Dashboard
                </h1>
                <p
                    className="text-sm"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                >
                    गार्ड डैशबोर्ड
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3 px-5 mb-4">
                <StatCard
                    label="Queue"
                    value={queueVehicles.length}
                    color="--warning"
                />
                <StatCard
                    label="Inside"
                    value={insideVehicles.length}
                    color="--success"
                />
                <StatCard
                    label="Done"
                    value={vehicles.filter((v) => v.status === "completed").length}
                    color="--accent"
                />
            </div>

            {/* TABS */}
            <div className="flex px-5 gap-2 mb-3">
                <TabButton
                    active={activeTab === "queue"}
                    onClick={() => setActiveTab("queue")}
                >
                    Queue ({queueVehicles.length})
                </TabButton>

                <TabButton
                    active={activeTab === "inside"}
                    onClick={() => setActiveTab("inside")}
                >
                    Inside ({insideVehicles.length})
                </TabButton>
            </div>

            {/* LIST */}
            <div className="px-5 space-y-3 pb-6 overflow-auto flex-1">
                {displayed.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="w-full rounded-xl p-4 flex items-center gap-3 text-left transition-all"
                        style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "hsl(var(--primary) / 0.1)" }}
                        >
                            <span
                                className="text-sm font-bold"
                                style={{ color: "hsl(var(--primary))" }}
                            >
                                #{v.token}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p
                                className="text-sm font-semibold truncate"
                                style={{ color: "hsl(var(--foreground))" }}
                            >
                                {v.vehicleNo}
                            </p>
                            <p
                                className="text-xs"
                                style={{ color: "hsl(var(--muted-foreground))" }}
                            >
                                {v.driverName}
                            </p>
                        </div>

                        <ChevronRight
                            className="w-4 h-4"
                            style={{ color: "hsl(var(--muted-foreground))" }}
                        />
                    </button>
                ))}

                {displayed.length === 0 && (
                    <div
                        className="text-center py-12"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                        No vehicles in this category
                    </div>
                )}
            </div>

            {/* ===================== */}
            {/* BOTTOM SHEET */}
            {/* ===================== */}
            {selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "hsl(var(--foreground) / 0.4)" }}
                        onClick={() => setSelectedVehicle(null)}
                    />

                    {/* SHEET */}
                    <div
                        className="relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-[slideUp_0.25s_ease-out]"
                        style={{
                            background: "hsl(var(--card))",
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: "hsl(var(--foreground))" }}
                                >
                                    {selectedVehicle.vehicleNo}
                                </h2>
                                <p
                                    className="text-sm"
                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                >
                                    {selectedVehicle.driverName}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedVehicle(null)}
                                style={{ color: "hsl(var(--muted-foreground))" }}
                                className="text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            {[
                                { label: "Token", value: `#${selectedVehicle.token}` },
                                { label: "DO Number", value: selectedVehicle.doNumber },
                                { label: "RFID", value: selectedVehicle.rfid },
                                { label: "Status", value: selectedVehicle.status },
                                ...(selectedVehicle.entryTime
                                    ? [{ label: "Entry Time", value: selectedVehicle.entryTime }]
                                    : []),
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between">
                                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                                        {item.label}
                                    </span>
                                    <span style={{ color: "hsl(var(--foreground))" }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {selectedVehicle.status === "waiting" && (
                            <>
                                <button
                                    onClick={() => handleCheckIn(selectedVehicle.id)}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    Approve Entry
                                </button>

                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                                    style={{
                                        background: "hsl(var(--destructive))",
                                        color: "hsl(var(--destructive-foreground))",
                                    }}
                                >
                                    Reject
                                </button>
                            </>
                        )}

                        {(selectedVehicle.status === "inside" ||
                            selectedVehicle.status === "loading") && (
                                <button
                                    onClick={() => handleCheckOut(selectedVehicle.id)}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    Check Out
                                </button>
                            )}
                    </div>
                </div>
            )}

            {/* ===================== */}
            {/* REJECT MODAL */}
            {/* ===================== */}
            {showRejectModal && selectedVehicle && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-5">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "hsl(var(--foreground) / 0.6)" }}
                        onClick={() => setShowRejectModal(false)}
                    />

                    {/* MODAL */}
                    <div
                        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[slideUp_0.25s_ease-out]"
                        style={{
                            background: "hsl(var(--card))",
                        }}
                    >
                        <h3
                            className="text-lg font-bold mb-3"
                            style={{ color: "hsl(var(--foreground))" }}
                        >
                            Reject Vehicle
                        </h3>

                        <textarea
                            value={rejectRemark}
                            onChange={(e) => setRejectRemark(e.target.value)}
                            placeholder="Enter reason..."
                            className="w-full px-4 py-3 rounded-xl h-24 resize-none"
                            style={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--input))",
                                color: "hsl(var(--foreground))",
                            }}
                        />

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-3 rounded-xl font-semibold"
                                style={{
                                    border: "1px solid hsl(var(--primary))",
                                    color: "hsl(var(--primary))",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!rejectRemark}
                                onClick={() => handleReject(selectedVehicle.id)}
                                className="flex-1 py-3 rounded-xl font-semibold disabled:opacity-50"
                                style={{
                                    background: "hsl(var(--destructive))",
                                    color: "hsl(var(--destructive-foreground))",
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ===================== */
/* SMALL REUSABLE UI */
/* ===================== */

function StatCard({ label, value, color }) {
    return (
        <div
            className="rounded-xl p-3 text-center"
            style={{ background: `hsl(var(${color}) / 0.1)` }}
        >
            <span
                className="text-2xl font-bold"
                style={{ color: `hsl(var(${color}))` }}
            >
                {value}
            </span>
            <p
                className="text-xs mt-1"
                style={{ color: "hsl(var(--muted-foreground))" }}
            >
                {label}
            </p>
        </div>
    );
}

function TabButton({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={
                active
                    ? {
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                    }
                    : {
                        background: "hsl(var(--muted))",
                        color: "hsl(var(--muted-foreground))",
                    }
            }
        >
            {children}
        </button>
    );
}

function PrimaryButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3"
            style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
            }}
        >
            {children}
        </button>
    );
}

function DangerButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{
                background: "hsl(var(--destructive))",
                color: "hsl(var(--destructive-foreground))",
            }}
        >
            {children}
        </button>
    );
}
