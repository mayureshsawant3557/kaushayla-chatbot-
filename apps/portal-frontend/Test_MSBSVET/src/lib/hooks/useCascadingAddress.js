import { useEffect, useRef } from "react";

export const useCascadingAddress = (
    formData,
    setFormData,
    isAutoFillingAddress
) => {
    const prevStateId = useRef();
    const prevDistrictId = useRef();

    // 🔹 State → District/Taluka/City reset
    useEffect(() => {
        if (isAutoFillingAddress) return;

        if (
            prevStateId.current &&
            prevStateId.current !== formData.StateID
        ) {
            setFormData(prev => ({
                ...prev,
                DistrictID: "",
                TalukaID: "",
                CityID: "",
                CityName: ""
            }));
        }

        prevStateId.current = formData.StateID;
    }, [formData.StateID]);

    // 🔹 District → Taluka/City reset
    useEffect(() => {
        if (isAutoFillingAddress) return;

        if (
            prevDistrictId.current &&
            prevDistrictId.current !== formData.DistrictID
        ) {
            setFormData(prev => ({
                ...prev,
                TalukaID: "",
                CityID: "",
                CityName: ""
            }));
        }

        prevDistrictId.current = formData.DistrictID;
    }, [formData.DistrictID]);
};