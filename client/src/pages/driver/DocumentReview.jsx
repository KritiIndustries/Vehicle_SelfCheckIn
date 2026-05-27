
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import InfoBanner from "@/components/InfoBanner";
import usePageAudio from "@/hooks/usePageAudio";
import { CheckExpiryDate } from "@/Helpers/CheckExpiryDate";
import { toast } from "sonner";
import axios from "axios";

const emptyState = {
  dl: { name: "", licenseNo: "", expiryDate: "" },
  insurance: { policyNo: "", expiryDate: "" },
  rc: { vehicleNo: "", chassisNo: "", expiryDate: "" },
  fitness: { expiryDate: "" },
};

const DocumentReview = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState(emptyState);
  const [speak, audioEnabled, toggleAudio] = usePageAudio();
  const [originalDocs, setOriginalDocs] = useState(emptyState);
  const API = import.meta.env.VITE_API_BASE_URL;

  // ✅ Load OCR data Working Fine
  // useEffect(() => {
  //   speak('कृपया अपने डॉक्यूमेंट्स की जांच करें');
  //   const raw = sessionStorage.getItem("ocrData");
  //   if (!raw) {
  //     navigate("/driver/documents");
  //     return;
  //   }

  //   const parsed = JSON.parse(raw || "{}");

  //   setDocs({
  //     dl: {
  //       name: parsed?.dl?.fields?.name || "",
  //       licenseNo: parsed?.dl?.fields?.licenseNo || "",
  //       expiryDate: parsed?.dl?.fields?.expiryDate || "",
  //     },
  //     insurance: {
  //       policyNo: parsed?.insurance?.fields?.policyNo || "",
  //       expiryDate: parsed?.insurance?.fields?.expiryDate || "",
  //     },
  //     rc: {
  //       vehicleNo: parsed?.rc?.fields?.vehicleNo || "",
  //       chassisNo: parsed?.rc?.fields?.chassisNo || "",
  //       expiryDate: parsed?.rc?.fields?.expiryDate || "",
  //     },
  //     fitness: {
  //       expiryDate: parsed?.fitness?.fields?.expiryDate || "",
  //     },
  //   });
  // }, [navigate, speak]);


  useEffect(() => {
    speak('कृपया अपने डॉक्यूमेंट्स की जांच करें');

    const raw = sessionStorage.getItem("ocrData");
    if (!raw) {
      navigate("/driver/documents");
      return;
    }

    const parsed = JSON.parse(raw || "{}");

    const formatted = {
      dl: {
        name: parsed?.dl?.fields?.name || "",
        licenseNo: parsed?.dl?.fields?.licenseNo || "",
        expiryDate: parsed?.dl?.fields?.expiryDate || "",
      },
      insurance: {
        policyNo: parsed?.insurance?.fields?.policyNo || "",
        expiryDate: parsed?.insurance?.fields?.expiryDate || "",
      },
      rc: {
        vehicleNo: parsed?.rc?.fields?.vehicleNo || "",
        chassisNo: parsed?.rc?.fields?.chassisNo || "",
        expiryDate: parsed?.rc?.fields?.expiryDate || "",
      },
      fitness: {
        expiryDate: parsed?.fitness?.fields?.expiryDate || "",
      },
    };

    setDocs(formatted);
    setOriginalDocs(formatted);
  }, [navigate, speak]);
  // ✅ Compute expired docs reactively from current docs state
  const expiredDocs = {
    dl: docs.dl.expiryDate && !CheckExpiryDate(docs.dl.expiryDate),
    insurance: docs.insurance.expiryDate && !CheckExpiryDate(docs.insurance.expiryDate),
    rc: docs.rc.expiryDate && !CheckExpiryDate(docs.rc.expiryDate),
    fitness: docs.fitness.expiryDate && !CheckExpiryDate(docs.fitness.expiryDate),
  };

  const hasExpiredDoc = Object.values(expiredDocs).some(Boolean);

  // ✅ Speak when expired docs detected after data loads
  useEffect(() => {
    if (hasExpiredDoc) {
      const expiredNames = [
        expiredDocs.dl && "Driving License",
        expiredDocs.insurance && "Insurance",
        expiredDocs.rc && "RC",
        expiredDocs.fitness && "Fitness Certificate",
      ].filter(Boolean).join(", ");

      speak(`यह दस्तावेज़ समाप्त हो गए हैं: ${expiredNames}। कृपया Renew करें।`);
    }
  }, [hasExpiredDoc]);

  const handleChange = (section, field, value) => {
    setDocs((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };
  const getEditedFields = (original, updated) => {
    const changes = {};

    Object.keys(updated).forEach((key) => {
      const oldValue = original[key] ?? "";
      const newValue = updated[key] ?? "";

      if (oldValue !== newValue) {
        changes[key] = {
          old: oldValue,
          new: newValue
        };
      }
    });

    return changes;
  };

  //Working Fine
  // const handleNext = () => {
  //   if (hasExpiredDoc) {
  //     const expiredNames = [
  //       expiredDocs.dl && "Driving License",
  //       expiredDocs.insurance && "Insurance",
  //       expiredDocs.rc && "अर्सी",
  //       expiredDocs.fitness && "फिटनेस Certificate",
  //     ].filter(Boolean).join(", ");

  //     toast.error(`Expired documents: ${expiredNames}`);
  //     speak(`यह दस्तावेज़ समाप्त हो गए हैं: ${expiredNames}। कृपया Renew करें।`);
  //     return;
  //   }

  //   sessionStorage.setItem("ocrConfirmedData", JSON.stringify(docs));
  //   navigate("/driver/selfie");
  // };

  // ✅ Helper — border class based on expiry

  const validateFields = () => {
    const validations = [
      {
        value: docs.dl.name,
        message: "Driver Name is required",
      },
      {
        value: docs.dl.licenseNo,
        message: "License Number is required",
      },
      {
        value: docs.dl.expiryDate,
        message: "DL Expiry Date is required",
      },

      {
        value: docs.insurance.policyNo,
        message: "Policy Number is required",
      },
      {
        value: docs.insurance.expiryDate,
        message: "Insurance Expiry Date is required",
      },

      {
        value: docs.rc.vehicleNo,
        message: "Vehicle Number is required",
      },
      {
        value: docs.rc.chassisNo,
        message: "Chassis Number is required",
      },
      {
        value: docs.rc.expiryDate,
        message: "RC Expiry Date is required",
      },

      {
        value: docs.fitness.expiryDate,
        message: "Fitness Expiry Date is required",
      },
    ];

    for (const field of validations) {
      if (!field.value || !field.value.toString().trim()) {
        toast.error(field.message);
        speak(field.message);
        return false;
      }
    }

    return true;
  };
  const handleNext = async () => {
    // ✅ Empty field validation
    const isValid = validateFields();

    if (!isValid) return;
    if (hasExpiredDoc) {
      const expiredNames = [
        expiredDocs.dl && "Driving License",
        expiredDocs.insurance && "Insurance",
        expiredDocs.rc && "RC",
        expiredDocs.fitness && "Fitness Certificate",
      ].filter(Boolean).join(", ");

      toast.error(`Expired documents: ${expiredNames}`);
      speak(`यह दस्तावेज़ समाप्त हो गए हैं: ${expiredNames}`);
      return;
    }

    try {

      const docTypes = ["dl", "insurance", "rc", "fitness"];
      const editedData = [];
      for (const type of docTypes) {
        const changes = getEditedFields(originalDocs[type], docs[type]);

        if (Object.keys(changes).length > 0) {
          editedData.push({
            docType: type.toUpperCase(),
            editedFields: changes,
            imagePath: null
          });
        }
      }
      sessionStorage.setItem("editedDocs", JSON.stringify(editedData));
      sessionStorage.setItem("ocrConfirmedData", JSON.stringify(docs));
      navigate("/driver/selfie");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save edited documents");
    }
  };
  const sectionBorder = (key, defaultColor) =>
    expiredDocs[key]
      ? "border-red-500 bg-red-50"
      : `border-${defaultColor}-200 bg-white`;

  const inputBorder = (key) =>
    expiredDocs[key]
      ? "border-red-400 bg-red-50"
      : "border-default-medium bg-neutral-secondary-medium";

  return (
    <div className="mobile-container">
      <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
      <InfoBanner
        text="Please confirm your document details"
        textHi="कृपया अपने दस्तावेज़ विवरण की पुष्टि करें"
      />

      <div className="page-content">
        <StepIndicator
          currentStep={3}
          totalSteps={4}
          label="Verify Documents"
          labelHi="दस्तावेज़ जांचें"
        />

        <div className="mt-5 space-y-5">

          {/* DRIVING LICENSE */}
          <section className={`shadow-sm rounded-xl border p-5 space-y-4 ${sectionBorder("dl", "green")}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${expiredDocs.dl ? "text-red-600" : "text-green-700"}`}>
                  Driving License
                </h3>
                <p className="text-xs text-gray-500">ड्राइविंग लाइसेंस</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded ${expiredDocs.dl ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  DL
                </span>
                {expiredDocs.dl && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                    Expired / समाप्त
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Driver Name</label>
                <p className="text-xs text-gray-400 mb-1">ड्राइवर का नाम</p>
                <input
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("dl")}`}
                  value={docs.dl.name}
                  onChange={(e) => handleChange("dl", "name", e.target.value)}
                  placeholder="Driver Name / ड्राइवर नाम"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">License Number</label>
                <p className="text-xs text-gray-400 mb-1">लाइसेंस नंबर</p>
                <input
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("dl")}`}
                  value={docs.dl.licenseNo}
                  onChange={(e) => handleChange("dl", "licenseNo", e.target.value.toUpperCase())}
                  placeholder="License Number / लाइसेंस नंबर"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expiry Date</label>
                <p className="text-xs text-gray-400 mb-1">समाप्ति तिथि</p>
                <input
                  type="date"
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("dl")}`}
                  value={docs.dl.expiryDate}
                  onChange={(e) => handleChange("dl", "expiryDate", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* INSURANCE */}
          <section className={`shadow-sm rounded-xl border p-5 space-y-4 ${sectionBorder("insurance", "blue")}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${expiredDocs.insurance ? "text-red-600" : "text-blue-700"}`}>
                  Insurance
                </h3>
                <p className="text-xs text-gray-500">बीमा</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded ${expiredDocs.insurance ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                  INS
                </span>
                {expiredDocs.insurance && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                    Expired / समाप्त
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Policy Number</label>
                <p className="text-xs text-gray-400 mb-1">पॉलिसी नंबर</p>
                <input
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("insurance")}`}
                  value={docs.insurance.policyNo}
                  onChange={(e) => handleChange("insurance", "policyNo", e.target.value)}
                  placeholder="Policy Number / पॉलिसी नंबर"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expiry Date</label>
                <p className="text-xs text-gray-400 mb-1">समाप्ति तिथि</p>
                <input
                  type="date"
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("insurance")}`}
                  value={docs.insurance.expiryDate}
                  onChange={(e) => handleChange("insurance", "expiryDate", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* RC */}
          <section className={`shadow-sm rounded-xl border p-5 space-y-4 ${sectionBorder("rc", "purple")}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${expiredDocs.rc ? "text-red-600" : "text-purple-700"}`}>
                  Registration Certificate
                </h3>
                <p className="text-xs text-gray-500">आरसी</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded ${expiredDocs.rc ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
                  RC
                </span>
                {expiredDocs.rc && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                    Expired / समाप्त
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Vehicle Number</label>
                <p className="text-xs text-gray-400 mb-1">वाहन नंबर</p>
                <input
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("rc")}`}
                  value={docs.rc.vehicleNo}
                  onChange={(e) => handleChange("rc", "vehicleNo", e.target.value.toUpperCase())}
                  placeholder="Vehicle Number / वाहन नंबर"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Chassis Number</label>
                <p className="text-xs text-gray-400 mb-1">चेसिस नंबर</p>
                <input
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("rc")}`}
                  value={docs.rc.chassisNo}
                  onChange={(e) => handleChange("rc", "chassisNo", e.target.value.toUpperCase())}
                  placeholder="Chassis Number / चेसिस नंबर"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expiry Date</label>
                <p className="text-xs text-gray-400 mb-1">समाप्ति तिथि</p>
                <input
                  type="date"
                  className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("rc")}`}
                  value={docs.rc.expiryDate}
                  onChange={(e) => handleChange("rc", "expiryDate", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* FITNESS */}
          <section className={`shadow-sm rounded-xl border p-5 space-y-4 ${sectionBorder("fitness", "orange")}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${expiredDocs.fitness ? "text-red-600" : "text-orange-700"}`}>
                  Fitness Certificate
                </h3>
                <p className="text-xs text-gray-500">फिटनेस प्रमाण पत्र</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded ${expiredDocs.fitness ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                  FIT
                </span>
                {expiredDocs.fitness && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                    Expired / समाप्त
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Expiry Date</label>
              <p className="text-xs text-gray-400 mb-1">समाप्ति तिथि</p>
              <input
                type="date"
                className={`text-heading text-sm rounded focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs border ${inputBorder("fitness")}`}
                value={docs.fitness.expiryDate}
                onChange={(e) => handleChange("fitness", "expiryDate", e.target.value)}
              />
            </div>
          </section>

        </div>
      </div>

      <div className="page-bottom">
        <button
          onClick={handleNext}
          disabled={hasExpiredDoc}
          className={`btn-primary-full ${hasExpiredDoc ? "opacity-50 cursor-not-allowed bg-red-500" : ""}`}
        >
          {hasExpiredDoc
            ? "Documents Expired / दस्तावेज़ समाप्त"
            : "Confirm & Continue / पुष्टि करें"}
        </button>
      </div>
    </div>
  );
};

export default DocumentReview;