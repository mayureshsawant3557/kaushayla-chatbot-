import { useState, useEffect } from 'react';
import Dashboard from '../../formcomponent/DashboardComponent';
import agent from "../../../lib/api/agent"
import { userDetailsAPI } from '../../../Endpoints_All/Account/userManagement'

// Main component that fetches API data and uses Dashboard
const UserDashboardPage = ({ userLoginId
     }) => {
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            let userTypeId = 0;

            if (userLoginId === "CMSAdmin") {
                userTypeId = 10;
            } else if (userLoginId == "MANTRALAYA") {
                userTypeId = 111;
            } else if (userLoginId === "DIRECTOR") {
                userTypeId = 112;
            }

            const response = await agent.get(
                // `${userDetailsAPI}?userTypeId=10&userLoginId=${userLoginId}`
                `${userDetailsAPI}?userTypeId=${userTypeId}&userLoginId=${userLoginId}`
            );

            // Axios already returns parsed data
            const data = response?.data;

            // API returns array → take first item
            setApiData(data?.[0] || {});

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return <Dashboard displayData={apiData} />;
};

export default UserDashboardPage;