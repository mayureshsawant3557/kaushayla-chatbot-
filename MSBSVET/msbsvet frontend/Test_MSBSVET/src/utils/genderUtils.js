export const getTitleFromGender = (gender) => {
    if (!gender) return "";
    const map = {
        MALE: "Mr",
        FEMALE: "Mrs",
    };
    return map[gender.toUpperCase()] || "";
};