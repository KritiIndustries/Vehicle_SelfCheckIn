import { useEffect, useRef, useState } from "react";
import {
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    ChevronRight,
    Eye,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import PickerSheet from "@/components/PickerSheet";

import axios from "axios";
import formatApiDate from "@/services/formatApiDate.service";
import { set } from "date-fns";
import { Loader2 } from "lucide-react";
import CallButton from "../driver/components/CallButton";

const API = import.meta.env.VITE_API_BASE_URL;
export default function GuardDashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState("queue");
    const [rejectRemark, setRejectRemark] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [viewedDocs, setViewedDocs] = useState(new Set());
    const [documents, setDocuments] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const fileInputRef = useRef(null);
    const [numberPlateUploaded, setNumberPlateUploaded] = useState(false);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/guard/getCheckedinDetails`);

            const formatted = res.data.data.map((item) => ({
                id: item.Id,
                vehicleNo: item.Vehicle_No,
                driverName: item.Driver_Name,
                doNumber: item.Do_No,
                status: mapStatus(item.Status),
                entryTime: item.ReportIn_Time ?? item.Entry_Time,
                documents: item.Documents,
                Token: item.Token,
                Zgp: item.Zgp,
                Mobile: item.Mobile,
            }));

            setVehicles(formatted);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };
    const mapStatus = (status) => {
        if (status === "ReportIn") return "waiting";
        if (status === "CheckedIn") return "CheckedIn";
        if (status === "CheckedOut") return "CheckedOut";
        return "waiting";
    };

    const queueVehicles = vehicles.filter((v) => v.status === "waiting");
    const insideVehicles = vehicles.filter(
        (v) => v.status === "CheckedIn" || v.status === "loading",
    );

    const handleCheckIn = async (id) => {
        try {
            setActionLoading(`checkin-${id}`);

            const token = localStorage.getItem("guardToken");

            if (!token) {
                toast.error("Session expired. Please login again.");
                return;
            }

            await axios.patch(
                `${API}/api/guard/approve/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            fetchVehicles();
            setSelectedVehicle(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Approval failed");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckOut = async (id) => {
        try {
            setActionLoading(`checkout-${id}`);
            await axios.patch(`${API}/api/guard/checkout/${id}`);
            fetchVehicles();
            setSelectedVehicle(null);
        } catch (err) {
            toast.error("Checkout failed");
        } finally {
            setActionLoading(null);
        }
    };
    // ✅ Reset viewed docs when a new vehicle is selected
    useEffect(() => {
        setViewedDocs(new Set());
        setNumberPlateUploaded(false);
        fetchVehicles(); // Refresh data to get latest doc statuses
    }, [selectedVehicle?.id]);
    // ✅ Mark doc as viewed
    const handleViewDoc = (docType, url) => {
        setViewedDocs((prev) => new Set([...prev, docType]));
        window.open(url, "_blank");
    };
    // ✅ All 5 docs viewed?
    const allDocsViewed =
        selectedVehicle?.documents?.length > 0 &&
        selectedVehicle.documents.every((doc) => viewedDocs.has(doc.Doc_Type));

    const handleDocumentClick = (documents) => {
        setDocuments(documents);
        if (documents.length === 5) {
            setShowImageModal(true);
        }
        return;
    };

    const handleReject = async (id) => {
        try {
            setActionLoading(`reject-${id}`);

            const token = localStorage.getItem("guardToken");
            if (!token) {
                toast.error("Session expired. Please login again.");
                return;
            }

            await axios.patch(
                `${API}/api/guard/reject/${id}`,
                { remark: rejectRemark },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            toast.success("Vehicle rejected");
            setShowRejectModal(false);
            setRejectRemark("");
            fetchVehicles();
            setSelectedVehicle(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Reject failed");
        } finally {
            setActionLoading(null);
        }
    };

    const displayed = activeTab === "queue" ? queueVehicles : insideVehicles;

    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <div className="mobile-container">
            <AppHeader showAudio={false} showLogOut={true} />

            {/* HEADER */}
            <div className="px-5 pt-4 pb-2 shrink-0">
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
            <div className="grid grid-cols-2 gap-2 px-5 mb-4 shrink-0">
                <StatCard
                    label="Reported In"
                    value={queueVehicles.length}
                    color="--warning"
                />
                <StatCard
                    label="CheckedIn"
                    value={insideVehicles.length}
                    color="--success"
                />
                {/* <StatCard
                    label="Done"
                    value={vehicles.filter((v) => v.status === "CheckedOut").length}
                    color="--accent"
                /> */}
            </div>

            {/* TABS */}
            <div className="flex px-5 gap-2 mb-3 shrink-0">
                <TabButton
                    active={activeTab === "queue"}
                    onClick={() => setActiveTab("queue")}
                >
                    Queue ({queueVehicles.length})
                </TabButton>

                <TabButton
                    active={activeTab === "CheckedIn"}
                    onClick={() => setActiveTab("CheckedIn")}
                >
                    Inside ({insideVehicles.length})
                </TabButton>
            </div>

            {/* LIST */}
            <div className="px-5 space-y-3 pb-6 flex-1 overflow-y-auto">
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
                                #{v.Token}
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
                                    {selectedVehicle.driverName}{" "}
                                    <CallButton
                                        phoneNumber={selectedVehicle.Mobile}
                                        label={`${selectedVehicle.Mobile}`}
                                    />
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
                                { label: "Token", value: `#${selectedVehicle.Token}` },
                                { label: "DO Number", value: selectedVehicle.doNumber },
                                { label: "ZGP", value: selectedVehicle.Zgp },
                                { label: "Status", value: selectedVehicle.status },
                                ...(selectedVehicle.entryTime
                                    ? [
                                        {
                                            label: "Reported Time",
                                            value: formatApiDate(selectedVehicle.entryTime),
                                        },
                                    ]
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

                        {/* VIEW DOCUMENT IMAGES */}
                        {selectedVehicle.documents &&
                            selectedVehicle.documents.length > 0 && (
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3"
                                    style={{
                                        border: "1px solid hsl(var(--primary))",
                                        color: "hsl(var(--primary))",
                                    }}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Uploaded Images
                                </button>
                            )}

                        {/* Upload using shared picker */}
                        <button
                            onClick={() => setShowPicker(true)}
                            disabled={!allDocsViewed}
                            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "hsl(var(--primary))",
                                color: "hsl(var(--primary-foreground))",
                            }}
                        >
                            {numberPlateUploaded
                                ? "✓ Number Plate Uploaded"
                                : !allDocsViewed
                                    ? "Upload Number Plate (View all docs first)"
                                    : "Upload Number Plate"}
                        </button>

                        {/* {selectedVehicle.status === "waiting" && (
                            <>
                              
                                <button
                                    onClick={() => handleCheckIn(selectedVehicle.id)}
                                    disabled={actionLoading === `checkin-${selectedVehicle.id}`}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 disabled:opacity-70"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    {actionLoading === `checkin-${selectedVehicle.id}` ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Approve Entry"
                                    )}
                                </button>
                                //TODO: add REJECT state
                                
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
                        )} */}
                        {selectedVehicle.status === "waiting" && (
                            <>
                                <button
                                    onClick={() => handleCheckIn(selectedVehicle.id)}
                                    disabled={
                                        actionLoading === `checkin-${selectedVehicle.id}` ||
                                        !allDocsViewed || // ✅ blocked until all docs viewed
                                        !numberPlateUploaded // ✅ blocked until number plate is uploaded
                                    }
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    {actionLoading === `checkin-${selectedVehicle.id}` ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : !allDocsViewed ? (
                                        `View all docs first (${viewedDocs.size}/${selectedVehicle.documents?.length})`
                                    ) : !numberPlateUploaded ? (
                                        "Upload number plate first"
                                    ) : (
                                        "Approve Entry"
                                    )}
                                </button>
                            </>
                        )}

                        {(selectedVehicle.status === "CheckedIn" ||
                            selectedVehicle.status === "loading") && (
                                <button
                                    onClick={() => handleCheckOut(selectedVehicle.id)}
                                    disabled={actionLoading === `checkout-${selectedVehicle.id}`}
                                    className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                                    style={{
                                        background: "hsl(var(--primary))",
                                        color: "hsl(var(--primary-foreground))",
                                    }}
                                >
                                    {actionLoading === `checkout-${selectedVehicle.id}` ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Check Out"
                                    )}
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

            {/* ===================== */}
            {/* IMAGE VIEWER MODAL */}
            {/* ===================== */}
            {showImageModal && selectedVehicle && selectedVehicle.documents && (
                <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "hsl(var(--foreground) / 0.7)" }}
                        onClick={() => setShowImageModal(false)}
                    />

                    {/* MODAL */}
                    <div
                        className="relative w-full max-w-md rounded-2xl p-4 max-h-[80vh] overflow-auto shadow-2xl"
                        style={{ background: "hsl(var(--card))" }}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3
                                className="text-lg font-bold"
                                style={{ color: "hsl(var(--foreground))" }}
                            >
                                Uploaded Images
                            </h3>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="text-xl"
                                style={{ color: "hsl(var(--muted-foreground))" }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* <div className="grid grid-cols-2 gap-3">
                            {selectedVehicle.documents.map((doc) => (
                                <div key={doc.Id} className="space-y-1">
                                    <div
                                        className="w-full overflow-hidden rounded-xl border"
                                        style={{ borderColor: "hsl(var(--border))" }}
                                    >
                                        <p
                                            className="text-xs font-medium text-center uppercase"
                                            style={{ color: "hsl(var(--muted-foreground))" }}
                                        >
                                            {doc.Doc_Type}
                                        </p>
                                        <div className="p-2 text-center">
                                            <div>
                                                <img
                                                    src={`${API}/api/guard/image/${doc.Image_Path}`}
                                                    alt={doc.Doc_Type}
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>

                                            <div className="w-full bg-blue-600 text-shadow rounded mt-1 text-white">
                                                <a
                                                    className=""
                                                    href={`${API}/api/guard/image/${doc.Image_Path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div> */}
                        <div className="grid grid-cols-2 gap-3">
                            {selectedVehicle.documents.map((doc) => {
                                const isViewed = viewedDocs.has(doc.Doc_Type);
                                const docUrl = `${API}/api/guard/image/${doc.Image_Path}`;

                                return (
                                    <div key={doc.Id} className="space-y-1">
                                        <div
                                            className="w-full overflow-hidden rounded-xl border"
                                            style={{
                                                borderColor: isViewed
                                                    ? "hsl(var(--success))" // ✅ green border if viewed
                                                    : "hsl(var(--border))",
                                            }}
                                        >
                                            <div className="flex items-center justify-between px-2 pt-1">
                                                <p
                                                    className="text-xs font-medium uppercase"
                                                    style={{ color: "hsl(var(--muted-foreground))" }}
                                                >
                                                    {doc.Doc_Type}
                                                </p>
                                                {/* ✅ Green check if viewed */}
                                                {isViewed && (
                                                    <span
                                                        style={{
                                                            color: "hsl(var(--success))",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-2 text-center">
                                                <img
                                                    src={docUrl}
                                                    alt={doc.Doc_Type}
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                                <button
                                                    onClick={() => handleViewDoc(doc.Doc_Type, docUrl)}
                                                    className="w-full mt-1 py-1 rounded text-white text-xs font-medium"
                                                    style={{
                                                        background: isViewed
                                                            ? "hsl(var(--success))" // ✅ green if already viewed
                                                            : "#2563eb",
                                                    }}
                                                >
                                                    {isViewed ? "✓ Viewed" : "View"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ✅ Show how many docs remaining */}
                        {!allDocsViewed && (
                            <p
                                className="text-xs text-center mt-2 mb-3"
                                style={{ color: "hsl(var(--muted-foreground))" }}
                            >
                                View all documents to enable approval ({viewedDocs.size}/
                                {selectedVehicle.documents.length} viewed)
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* Shared PickerSheet */}
            <PickerSheet
                show={showPicker}
                onClose={() => setShowPicker(false)}
                onPick={(type) => {
                    setShowPicker(false);

                    setTimeout(() => {
                        if (type === "camera") {
                            fileInputRef.current.setAttribute("capture", "environment");
                            fileInputRef.current.accept = "image/*";
                        } else {
                            fileInputRef.current.removeAttribute("capture");
                            fileInputRef.current.accept = "image/*";
                        }

                        fileInputRef.current.click();
                    }, 200);
                }}
            />

            {/* ✅ ADD INPUT HERE */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file || !selectedVehicle) return;

                    try {
                        const formData = new FormData();
                        formData.append("id", selectedVehicle.id);
                        formData.append("numberPlate", file);

                        const token = localStorage.getItem("guardToken");

                        await axios.post(`${API}/api/guard/upload-number-plate`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "multipart/form-data",
                            },
                        });
                        setNumberPlateUploaded(true);

                        toast.success("Number plate uploaded ✅");
                    } catch (err) {
                        console.error(err);
                        toast.error("Upload failed ❌");
                    }

                    e.target.value = "";
                }}
            />
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
