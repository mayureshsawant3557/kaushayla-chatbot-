import AnnouncementRow from "../Component/Home/AnnouncementRow";
import Ministers from "../Component/Home/Ministers";
import Menu from "../Component/Home/Menu";
import Notices from "../Component/Home/Notices";
import SignInPage from "../Component/Home/SignInPage";
import Video from "../Component/Home/Video";
import EducationOpportunities from "../Component/Home/EducationOpportunities";
import EmployeeDevelopement from "../Component/Home/EmployeeDevelopement";
import EntrepreneurshipCarousel from "../Component/Home/EntrepreneurshipCarousel";
import StatisticsCards from "../Component/Home/StatisticsCards";
import PaddedLayout from "../Component/Context/ReactComponent";
import SuccessStories from "../Component/Home/SuccessStory";
import { useEffect, useRef } from "react"; // ✅ Add useRef
import { useAuth } from "../Hooks/AuthContext";

function HomePage({ isLoggedIn, onLoginStateChange }) {
    const { logout, isLoggedIn: authIsLoggedIn } = useAuth();
    const hasLoggedOut = useRef(false); // ✅ Track if we already logged out

    useEffect(() => {
        // ✅ Only logout if user was ALREADY logged in when arriving at home
        // AND we haven't already logged out in this session
        if (authIsLoggedIn && !hasLoggedOut.current) {
            hasLoggedOut.current = true; // ✅ Prevent multiple logouts
            logout();

            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }, []); // ✅ Run ONLY on mount, not when authIsLoggedIn changes

    return (
        <>
            {/* AnnouncementRow without padding */}
            <AnnouncementRow />
            {/* Rest of the home page content with padding */}
            <PaddedLayout>
                <div className="mb-3 mt-3 flex flex-row">
                    <Ministers />
                </div>
                <div className="ml-4 sm:ml-1 mr-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2.5">
                    <Menu />
                    <Notices />
                    <SignInPage onLoginStateChange={onLoginStateChange} />
                </div>

                <Video />
                <SuccessStories />
                <EducationOpportunities />
                <EmployeeDevelopement />
                <EntrepreneurshipCarousel />
                <StatisticsCards />
            </PaddedLayout>
        </>
    );
}

export default HomePage;
