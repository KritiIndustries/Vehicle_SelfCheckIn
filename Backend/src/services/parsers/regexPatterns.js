const regexPatterns = {

    dlNumber: [
        /\b[A-Z]{2}\d{2}[A-Z]?\d{4}\d{7}\b/,
        /\b[A-Z]{2}\d{2}[A-Z]?[- ]?\d{4}[- ]?\d{7}\b/,
        /\bDL\d{10,15}\b/
    ],

    // vehicleNo: [
    //     /\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b/,
    //     /\b[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}\b/
    // ],
    vehicleNo: [
        /\b[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}\b/,       // MP09AB1234
        /\b[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}\b/,     // DL1CAB1234
        /\b[A-Z]{2}\d{2}[A-Z]{2}\d{3,4}\b/,
        /\b[A-Z]{2}\d{2}\d{4}\b/,
        /\b[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{4}\b/
    ],

    chassisNo: [
        /\b[A-HJ-NPR-Z0-9]{17}\b/,
        /\b[A-HJ-NPR-Z0-9]{16}\b/
    ],

    policyNo: [
        /\b[0-9]{6,20}\b/,
        /\b[A-Z]{2,5}[0-9]{6,15}\b/
    ],

    date: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g
};

export default regexPatterns