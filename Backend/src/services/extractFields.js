export function extractFields(text) {

    const licenseRegex =
        /[A-Z]{2}[0-9]{2}[A-Z]-[0-9]{4}-[0-9]{7}/;

    const vehicleRegex =
        /[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}/;

    const dateRegex =
        /[0-9]{2}[-\/][0-9]{2}[-\/][0-9]{4}/;

    const licenseNumber = text.match(licenseRegex)?.[0] || null;
    const vehicleNumber = text.match(vehicleRegex)?.[0] || null;
    const expiryDate = text.match(dateRegex)?.[0] || null;

    let driverName = null;

    const nameLine = text
        .split("\n")
        .find(line => line.toLowerCase().includes("name"));

    if (nameLine) {
        driverName = nameLine.split(":")[1]?.trim();
    }

    return {
        driver_name: driverName,
        license_number: licenseNumber,
        vehicle_number: vehicleNumber,
        expiry_date: expiryDate
    };
}