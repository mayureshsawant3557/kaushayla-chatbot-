export const formatDate = (dateStr) => {
    if (!dateStr) return null;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const d = new Date(dateStr);
    return isNaN(d) ? null : d.toISOString().split("T")[0];
};