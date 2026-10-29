import { useEffect, useState } from "react";
import agent from "../lib/api/agent";
import { GetStatusGreenRequirement } from "../Endpoints_All/Base/Institute";

const useGreenFieldRequirementLock = (
    instituteId,
    selectedFinancialYear
) => {

    const [isLocked, setIsLocked] = useState(false);
    const [formStatus, setFormStatus] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    const getStatus = async () => {

        if (!instituteId || !selectedFinancialYear) {
            setIsLocked(false);
            setFormStatus(null);
            return;
        }

        setCheckingStatus(true);

        try {
            
            const res = await agent.post(
                GetStatusGreenRequirement,
                {
                    instituteId: instituteId,
                    financialYearID: selectedFinancialYear
                }
            );

            console.log(
                "Green Field Status Response:",
                res?.data
            );

            const data = res?.data?.Data || [];

            const status =
                data?.[0]?.FormStatus ??
                data?.[0]?.formStatus ??
                null;

            setFormStatus(status);

            setIsLocked(
                String(status).toUpperCase() === "S"
            );

        } catch (error) {

            console.error(
                "Error fetching Green Field Requirement status:",
                error
            );

            setIsLocked(false);
            setFormStatus(null);

        } finally {
            setCheckingStatus(false);
        }
    };

    useEffect(() => {
        getStatus();
    }, [instituteId, selectedFinancialYear]);

    return {
        isLocked,
        formStatus,
        checkingStatus,
        refreshStatus: getStatus
    };
};

export default useGreenFieldRequirementLock;