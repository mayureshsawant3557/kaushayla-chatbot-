
import InstituteRoutes from "./InstituteRoutes";

import NewIstituteApprovalProcessRoutes from "./NewnstituteApprovalProcess";

const InstituteRouteSelector = ({
    userType,
    userLoginId,
    isLoggedIn,
    onLoginStateChange
}) => {
    if (userType === "Institute") {
        return (
            <InstituteRoutes
                userLoginId={userLoginId}
                isLoggedIn={isLoggedIn}
                onLoginStateChange={onLoginStateChange}
            />
        );
    }

    if (userType === "InstituteTempary") {
        return (
            <NewIstituteApprovalProcessRoutes
                userLoginId={userLoginId} 
                isLoggedIn={isLoggedIn}
                onLoginStateChange={onLoginStateChange}
            />
        );
    }

    // Fallback while userType is not yet known
    return <div>Loading...</div>;
};
export default InstituteRouteSelector;