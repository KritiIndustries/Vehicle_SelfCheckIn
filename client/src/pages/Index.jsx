
// import { useNavigate } from "react-router-dom";
// import { Truck, Shield } from "lucide-react";

// const Index = () => {
//     const navigate = useNavigate();

//     return (
//         <div className="mobile-container">
//             <div className="flex-1 flex flex-col items-center justify-center px-5">
//                 <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4">
//                     <span className="text-primary-foreground font-bold text-2xl">KP</span>
//                 </div>
//                 <h1 className="text-2xl font-bold text-foreground mb-1">Kasta Plant</h1>
//                 <p className="text-sm text-muted-foreground mb-10">कृति प्लांट में आपका स्वागत है</p>

//                 <div className="w-full space-y-4">
//                     <button onClick={() => navigate("/driver/login")} className="btn-primary-full text-lg py-5">
//                         <Truck className="w-6 h-6" />
//                         <div className="text-left">
//                             <span className="block">Driver Check-In</span>
//                             <span className="block text-xs opacity-80 font-normal">ड्राइवर चेक-इन</span>
//                         </div>
//                     </button>

//                     <button onClick={() => navigate("/guard/login")} className="btn-outline-primary text-lg py-5">
//                         <Shield className="w-6 h-6" />
//                         <div className="text-left">
//                             <span className="block">Guard Panel</span>
//                             <span className="block text-xs opacity-70 font-normal">गार्ड पैनल</span>
//                         </div>
//                     </button>
//                 </div>
//             </div>

//             <div className="page-bottom text-center">
//                 <p className="text-xs text-muted-foreground">Plant Driver Self Check-In System v1.0</p>
//             </div>
//         </div>
//     );
// };

// export default Index;



import { useNavigate } from "react-router-dom";
import { Truck, Shield } from "lucide-react";

const Index = () => {
    const navigate = useNavigate();

    return (
        <div className="mobile-container">
            <div className="flex-1 flex flex-col items-center justify-center px-5">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-2xl">KP</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Kasta Plant</h1>
                <p className="text-sm text-muted-foreground mb-10">कास्ता प्लांट में आपका स्वागत है</p>

                <div className="w-full space-y-4">
                    <button
                        onClick={() => navigate("/driver/location")}
                        className="btn-primary-full text-lg py-5"
                    >
                        <Truck className="w-6 h-6" />
                        <div className="text-left">
                            <span className="block">Driver Check-In</span>
                            <span className="block text-xs opacity-80 font-normal">ड्राइवर चेक-इन</span>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/guard/login")}
                        className="btn-outline-primary text-lg py-5"
                    >
                        <Shield className="w-6 h-6" />
                        <div className="text-left">
                            <span className="block">Guard Panel</span>
                            <span className="block text-xs opacity-70 font-normal">गार्ड पैनल</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="page-bottom text-center">
                <p className="text-xs text-muted-foreground">Plant Driver Self Check-In System v1.0</p>
            </div>
        </div>
    );
};

export default Index;
