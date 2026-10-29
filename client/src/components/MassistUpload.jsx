
import { useState } from "react";

const API_URL = "http://localhost:5000/api/massist/upload";

export default function MassistUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessage("Please select an Excel file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setMessage("");
        setResult(null);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
                // Add your existing authentication headers if required.
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed.");
            }

            setResult(data);
            setMessage(data.message || "Excel file processed successfully.");
        } catch (error) {
            setMessage(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-10">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">
                    Massist Excel Upload
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Upload your Excel sheet to update visit records and generate
                    employee performance reports.
                </p>

                <form onSubmit={handleUpload} className="mt-6 space-y-5">
                    <div>
                        <label
                            htmlFor="massist-file"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Select Excel file
                        </label>

                        <input
                            id="massist-file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                setFile(e.target.files?.[0] || null);
                                setMessage("");
                                setResult(null);
                            }}
                            className="block w-full rounded-lg border border-gray-300 p-3
                         text-sm file:mr-4 file:rounded-md file:border-0
                         file:bg-blue-50 file:px-4 file:py-2
                         file:font-medium file:text-blue-700
                         hover:file:bg-blue-100"
                        />
                    </div>

                    {file && (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            <p className="font-medium text-gray-800">{file.name}</p>
                            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3
                       font-semibold text-white transition
                       hover:bg-blue-700 disabled:cursor-not-allowed
                       disabled:bg-gray-400"
                    >
                        {loading ? "Processing Excel..." : "Upload Excel"}
                    </button>
                </form>

                {message && (
                    <div
                        role="status"
                        className={`mt-5 rounded-lg p-3 text-sm ${result
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {result && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Upload Summary
                        </h2>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                ["Total Rows", result.import?.totalRows],
                                ["Inserted", result.import?.inserted],
                                ["Updated", result.import?.updated],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">{label}</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-800">
                                        {value ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <h3 className="mt-6 font-semibold text-gray-800">
                            Performance Summary
                        </h3>

                        <div className="mt-3 space-y-3 rounded-lg border p-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span>Visit completion</span>
                                <strong>
                                    {result.summary?.visitPercentage == null
                                        ? "N/A"
                                        : `${result.summary.visitPercentage}%`}
                                </strong>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span>Marketing activity completion</span>
                                <strong>
                                    {result.summary?.marketingPercentage == null
                                        ? "N/A"
                                        : `${result.summary.marketingPercentage}%`}
                                </strong>
                            </div>

                            {result.emails?.status === "processing" ? (
                                <div className="flex justify-between gap-4">
                                    <span>Employee reports</span>
                                    <strong>Sending in background</strong>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between gap-4">
                                        <span>Emails sent</span>
                                        <strong>{result.emails?.sent ?? 0}</strong>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span>Emails failed</span>
                                        <strong>{result.emails?.failed?.length ?? 0}</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <details className="mt-5">
                            <summary className="cursor-pointer text-sm font-medium text-blue-700">
                                View full API response
                            </summary>
                            <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-300">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
