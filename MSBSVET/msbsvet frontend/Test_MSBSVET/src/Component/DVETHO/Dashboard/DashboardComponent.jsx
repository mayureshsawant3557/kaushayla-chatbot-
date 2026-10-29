import { useState, useEffect } from "react";
import Dashboard from "../../formcomponent/DashboardComponent";
import {
  userDetailsAPI,
  secretaryDashboardAPI,
} from "../../../Endpoints_All/Account/userManagement";
import agent from "../../../lib/api/agent";
import { useAuth } from "../../../Hooks/AuthContext";

// Main component that fetches API data and uses Dashboard
const DvethoDashboardPage = () => {
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendencyData, setPendencyData] = useState({});
  const [pendencyLoading, setPendencyLoading] = useState(true);

  const { userInfo } = useAuth();
  const user = userInfo;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await agent.get(
        `${userDetailsAPI}?userTypeId=${user?.UserTypeID}&userLoginId=${user?.UserLoginID}`,
      );
      if (response.data) {
        setApiData(response.data[0] || {});
      } else {
        setError("No data received from server");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mirrors DashboardWorker().GetSecretaryDashboard() in DashboardSecretary.aspx.cs
  // Actual response shape: { Data: { Table: [{ Activities, Cases }, ...] }, Message, Status, StatusCode }
  const fetchPendencyData = async () => {
    try {
      setPendencyLoading(true);
      const response = await agent.get(secretaryDashboardAPI);
      const rows = response?.data?.Data?.Table || [];

      const counts = {
        InComplete: 0,
        PendingApproval: 0,
        WithdrawVerification: 0,
        Verified: 0,
      };

      rows.forEach((row) => {
        // Some rows (e.g. a totals row) come back with Activities: null — skip those
        if (!row?.Activities) return;

        switch (row.Activities) {
          case "In-Complete":
            counts.InComplete = Number(row.Cases) || 0;
            break;
          case "Pending Approval":
            counts.PendingApproval = Number(row.Cases) || 0;
            break;
          case "Withdraw Verification":
            counts.WithdrawVerification = Number(row.Cases) || 0;
            break;
          case "Verified":
            counts.Verified = Number(row.Cases) || 0;
            break;
          default:
            break;
        }
      });

      setPendencyData(counts);
    } catch (err) {
    
    } finally {
      setPendencyLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Only Secretary (UserTypeID 81) has a Pendency Status Dashboard
    if (user?.UserTypeID === 81) {
      fetchPendencyData();
    } else {
      setPendencyLoading(false);
    }
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

  return (
    <Dashboard
      displayData={apiData}
      pendencyData={pendencyData}
      pendencyLoading={pendencyLoading}
    />
  );
};

export default DvethoDashboardPage;
