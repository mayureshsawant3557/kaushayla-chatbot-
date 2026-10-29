import { useState, useEffect } from 'react';
import Dashboard from '../../formcomponent/DashboardComponent';
import { userDetailsAPI } from '../../../Endpoints_All/Account/userManagement';
import agent from '../../../lib/api/agent';
// Main component that fetches API data and uses Dashboard
const UserDashboardPage = () => {
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

 const fetchUserData = async () => {
        try {
            setLoading(true);

            const response = await agent.get(
                `${userDetailsAPI}?userTypeId=31&userLoginId=BOARD02`
            );


            // axios gives data directly here
            setApiData(response.data[0] || {});
        } catch (err) {

            setError(err.response?.data?.message || err.message);
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