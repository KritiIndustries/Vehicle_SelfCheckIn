const normalizeText = (lines = []) => {
    return lines
        .map(l =>
            l
                .toUpperCase()
                .replace(/[|]/g, "I")
                .replace(/O/g, "0")
                // .replace(/[^A-Z0-9\/\-:\s]/g, "")
                .trim()
        )
        .filter(Boolean);
};
export default normalizeText;