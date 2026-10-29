import { useNavigate } from "react-router-dom";
import { getNextFlowPage, getPreviousFlowPage, getPageConfig, buildPageUrl } from "../Utils/inspectionFlow";
import { useAuth } from "./AuthContext";

/**
 * Handles navigation between all 15 inspection flow pages based on configuration.
 */
export const useInstituteFlow = (currentPageCode, p1, p2) => {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const userTypeID = Number(userInfo?.UserTypeID);

    const currentPage = getPageConfig(currentPageCode);
    const nextPage = getNextFlowPage(currentPageCode);
    const prevPage = getPreviousFlowPage(currentPageCode);

    const goNext = () => {
        if (nextPage) {
            navigate(buildPageUrl(nextPage, p1, p2));
        }
    };

    const goBack = () => {

        if (userTypeID === 64 && currentPageCode === "UnitsForInspection") {
            return;
        }
        if (prevPage) {
            navigate(buildPageUrl(prevPage, p1, p2));
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        if (userTypeID === 64) {
            navigate("/tinstitute/dashboard");
        } else {
            const reportParams = p1 && p2 ? `?p1=${encodeURIComponent(p2)}&p2=${encodeURIComponent(p1)}` : "";
            navigate(`/DVETO/InspectionReport${reportParams}`);
        }
    };

    return {
        currentPage,
        nextPage,
        prevPage,
        goNext,
        goBack,
        handleClose,
    };
};
