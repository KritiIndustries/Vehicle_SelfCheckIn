import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import DriverDetails from './DriverDetails';


// function ValidateHomePage() {
//   const API = import.meta.env.VITE_API_BASE_URL;
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const doValue = searchParams.get("DO");

//   useEffect(() => {
//     if (!doValue) return;

//     const validate = async () => {
//       try {
//         const res = await axios.get(`${API}/api/driver/validatePage/${doValue}`);

//         const data = res.data.data;

//         // ✅ If already reported → go success page
//         if (data.Status === "ReportIn" || data.Status === "CheckedIn") {
//           navigate("/driver/success", { state: data });
//         } else {
//           navigate("/d", {
//             state: {
//               doNumber: data.Do_No,
//               mobile: data.Mobile,
//             },
//           });
//         }

//       } catch (err) {
//         // ❌ Driver not found → new entry flow
//         navigate("/d", {
//           state: {
//             doNumber: doValue,
//           },
//         });
//       }
//     };

//     validate();
//   }, [doValue]);

//   return <div>Loading...</div>;
// }
function ValidateHomePage() {
  const API = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const doValue = searchParams.get("DO");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doValue) {
      navigate("/"); // fallback
      return;
    }

    const validate = async () => {
      try {
        const res = await axios.get(`${API}/api/driver/validatePage/${doValue}`);

        const data = res.data.data;

        // ✅ Already reported → go success
        if (data.Status === "ReportIn" || data.Status === "CheckedIn") {
          navigate("/driver/success", { state: data });
        } else {
          setLoading(false); // show form
        }

      } catch (err) {
        // ❌ Not found → new driver → show form
        setLoading(false);
      }
    };

    validate();
  }, [doValue]);

  if (loading) return <div>Checking...</div>;

  return <DriverDetails />;
}

export default ValidateHomePage