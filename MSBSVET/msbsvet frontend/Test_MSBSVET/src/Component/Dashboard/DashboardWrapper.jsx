import { useEffect, useState } from "react";
import Dashboard from "../../Component/formcomponent/DashboardComponent";
import { useUserDetails } from "../../lib/hooks/account.queries";
import LoadingScreen from "../../Component/formcomponent/LoadingScreen";
import ErrorScreen from "../../Component/formcomponent/ErrorScreen";
import { useAuth } from "../../Hooks/AuthContext";

// Import API caller and endpoints (Adjust paths as needed)
import agent from "../../lib/api/agent";
import { GetAdminDashboard } from "../../Endpoints_All/Account/userManagement";
import RenewalComponent from "../formcomponent/RenewalComponent";

const DashboardWrapper = ({ DashboardComponent }) => {
    const { userInfo } = useAuth();
    const userTypeId = userInfo?.UserTypeID;
    const userLoginId = userInfo?.UserLoginID;

    // React Query for primary user details
    const {
        data: userDetails,
        isLoading,
        isError,
        error,
    } = useUserDetails(userTypeId, userLoginId, {
        enabled: !!userTypeId && !!userLoginId,
    });

    // --- State for District Approval Dashboard ---
    const [districtData, setDistrictData] = useState({});
    const [districtLoading, setDistrictLoading] = useState(true);

    // Fetch Role-Specific Dashboard Data
    useEffect(() => {
        const fetchDistrictData = async () => {
            try {
                setDistrictLoading(true);
                const response = await agent.get(
                    `${GetAdminDashboard}?userTypeId=${userTypeId}&userLoginId=${userLoginId}`
                );
              

                // Assumes C# returns the 5 properties inside the first row of Table/Table1
                const dataRow = response?.data?.Data?.Table1?.[0] || response?.data?.Data?.Table?.[0] || {};

                setDistrictData({
                    TotalRegistered: Number(dataRow.TotalRegistered) || 0,
                    Admitted: Number(dataRow.Admitted) || 0,
                    Approved: Number(dataRow.Approved) || 0,
                    ApprovalPending: Number(dataRow.ApprovalPending) || 0,
                    ApprovalRejected: Number(dataRow.ApprovalRejected) || 0,
                });
            } catch (err) {
              
            } finally {
                setDistrictLoading(false);
            }
        };

       
        if (userTypeId === 14) {
            fetchDistrictData();
        } else {
            setDistrictLoading(false);
        }
    }, [userTypeId, userLoginId]);

    if (!userTypeId || !userLoginId) {
        return (
            <ErrorScreen message="User information not found. Please login again." />
        );
    }

    if (isLoading) {
        return <LoadingScreen status="Loading dashboard..." />;
    }

    if (isError) {
        return (
            <ErrorScreen
                message={error?.message || "Failed to load dashboard"}
            />
        );
    }

    if (!userDetails) {
        return (
            <ErrorScreen message="User details not available. Please try again." />
        );
    }

    const displayData = {
        UserId: userInfo.UserID,
        UserLoginID: userDetails.UserLoginID,
        UserType: userDetails.UserType,
        UserName: userDetails.UserName,
        IPAddress: userDetails.IPAddress,
        CurrentLoginDateTime: userDetails.CurrentLoginDateTime,
        LastLoginDateTime: userDetails.LastLoginDateTime,
        CollegeName: userDetails.CollegeName,
    };

    return (
        <>
            <Dashboard
                displayData={displayData}
                districtData={districtData}
                districtLoading={districtLoading}
            />

            {DashboardComponent && (
                <DashboardComponent userDetails={displayData} />
            )}

            {userTypeId === 61 &&
                (
                    <RenewalComponent UserLoginID={userInfo.UserLoginID} />
                
                )}

            

                
        </>
    );
};

export default DashboardWrapper;