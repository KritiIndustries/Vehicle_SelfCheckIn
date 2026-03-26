import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import StepIndicator from "@/components/StepIndicator";
import InfoBanner from "@/components/InfoBanner";
import usePageAudio from "@/hooks/usePageAudio";

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


  useEffect(() => {
    speak('कृपया अपने डॉक्यूमेंट्स की जांच करें');
    const raw = sessionStorage.getItem("ocrData");
    if (!raw) {
      navigate("/driver/documents");
      return;
    }

    const parsed = JSON.parse(raw || "{}");

    setDocs({
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
    });
  }, [navigate,speak]);

  const handleChange = (section, field, value) => {
    setDocs((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    sessionStorage.setItem("ocrConfirmedData", JSON.stringify(docs));
    navigate("/driver/selfie");
  };

  return (
    <div className="mobile-container border-green-500">
      <AppHeader audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />

      <InfoBanner
        text="Please confirm your document details"
        textHi="कृपया अपने दस्तावेज़ विवरण की पुष्टि करें"
      /> 

      <div className="page-content  ">
        <StepIndicator
          currentStep={3}
          totalSteps={4}
          label="Verify Documents"
          labelHi="दस्तावेज़ जांचें"
        />

        <div className="mt-5 space-y-5 ">

          {/* DRIVING LICENSE */}
          <section className="bg-white shadow-sm rounded-xl border border-green-200 p-5 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  Driving License
                </h3>
                <p className="text-xs text-gray-500">
                  ड्राइविंग लाइसेंस
                </p>
              </div>

              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                DL
              </span>
            </div>

            <div className="grid gap-4">

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Driver Name
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  ड्राइवर का नाम
                </p>

                <input
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.dl.name}
                  onChange={(e) => handleChange("dl", "name", e.target.value)}
                  placeholder="Driver Name / ड्राइवर नाम"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  License Number
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  लाइसेंस नंबर
                </p>

                <input
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.dl.licenseNo}
                  onChange={(e) => handleChange("dl", "licenseNo", e.target.value.toUpperCase())}
                  placeholder="License Number / लाइसेंस नंबर"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Expiry Date
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  समाप्ति तिथि
                </p>

                <input
                  type="date"
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.dl.expiryDate}
                  onChange={(e) => handleChange("dl", "expiryDate", e.target.value)}
                />
              </div>

            </div>
          </section>



          {/* INSURANCE */}
          <section className="bg-white shadow-sm rounded-xl border border-blue-200 p-5 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-700">
                  Insurance
                </h3>
                <p className="text-xs text-gray-500">
                  बीमा
                </p>
              </div>

              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                INS
              </span>
            </div>

            <div className="grid gap-4">

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Policy Number
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  पॉलिसी नंबर
                </p>

                <input
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.insurance.policyNo}
                  onChange={(e) => handleChange("insurance", "policyNo", e.target.value)}
                  placeholder="Policy Number / पॉलिसी नंबर"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Expiry Date
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  समाप्ति तिथि
                </p>

                <input
                  type="date"
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.insurance.expiryDate}
                  onChange={(e) => handleChange("insurance", "expiryDate", e.target.value)}
                />
              </div>

            </div>
          </section>



          {/* RC */}
          <section className="bg-white shadow-sm rounded-xl border border-purple-200 p-5 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-700">
                  Registration Certificate
                </h3>
                <p className="text-xs text-gray-500">
                  आरसी
                </p>
              </div>

              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                RC
              </span>
            </div>

            <div className="grid gap-4">

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Vehicle Number
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  वाहन नंबर
                </p>

                <input
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.rc.vehicleNo}
                  onChange={(e) => handleChange("rc", "vehicleNo", e.target.value.toUpperCase())}
                  placeholder="Vehicle Number / वाहन नंबर"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Chassis Number
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  चेसिस नंबर
                </p>

                <input
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.rc.chassisNo}
                  onChange={(e) => handleChange("rc", "chassisNo", e.target.value.toUpperCase())}
                  placeholder="Chassis Number / चेसिस नंबर"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Expiry Date
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  समाप्ति तिथि
                </p>

                <input
                  type="date"
                  className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
                  value={docs.rc.expiryDate}
                  onChange={(e) => handleChange("rc", "expiryDate", e.target.value)}
                />
              </div>

            </div>
          </section>



          {/* FITNESS */}
          <section className="bg-white shadow-sm rounded-xl border border-orange-200 p-5 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-700">
                  Fitness Certificate
                </h3>
                <p className="text-xs text-gray-500">
                  फिटनेस प्रमाण पत्र
                </p>
              </div>

              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                FIT
              </span>
            </div>

            <div>

              <label className="text-xs font-medium text-gray-600">
                Expiry Date
              </label>

              <p className="text-xs text-gray-400 mb-1">
                समाप्ति तिथि
              </p>

              <input
                type="date"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs rounded"
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
          className="btn-primary-full"
        >
          Confirm & Continue / पुष्टि करें
        </button>
      </div>
    </div>
  );
};

export default DocumentReview;

