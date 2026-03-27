export const CheckExpiryDate = (Docdate) => {
    const today = new Date(); // Current date and time
    const expiry = new Date(Docdate); // Convert input string to Date object

    // Check if the expiry date has already passed
    // If today is later than expiry, it is expired (true)
    return today < expiry;
}