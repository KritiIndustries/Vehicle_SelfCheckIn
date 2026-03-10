const findMatch = (text, patterns) => {
    for (const p of patterns) {
        const m = text.match(p);
        if (m) return m[0];
    }
    return null;
};
export default findMatch;