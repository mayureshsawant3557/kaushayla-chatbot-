import PendencyStatusDashboard from "./PendencyStatusDashboard";
import CandidateApprovalDashboard from "./CandidateApprovalDashboard"; // Ensure you've created this file from the previous answer

const Dashboard = ({
    displayData,
    pendencyData,
    pendencyLoading,
    districtData,
    districtLoading
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Default data structure if no data is provided
    const defaultData = {
        UserLoginID: "",
        UserType: "",
        UserName: "",
        IPAddress: "",
        CurrentLoginDateTime: "",
        LastLoginDateTime: "",
        CollegeName: "",
    };
    const data = { ...defaultData, ...displayData };

    const userTypeNormal = (data.UserType || "").trim().toLowerCase();

    // Define visibility rules based on the user's role text
    const isSecretary = userTypeNormal === "secretary";
    const isDistrict = userTypeNormal === "district"; // Check for District role text

    return (
        <div className="w-full p-4">
            <fieldset className="w-full rounded-lg border border-gray-300 p-4 ">
                <legend className="rounded-md border bg-gray-200 px-4 py-2 text-center font-bold text-gray-600">
                    Welcome to Maharashtra State Board of Skill, Vocational Education and
                    Training Portal
                </legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="flex">
                            <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                User Login ID
                            </div>
                            <div className="flex-grow rounded-r-lg border px-6 py-3">
                                {data.UserLoginID}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                User Type
                            </div>
                            <div className="flex-grow rounded-r-lg border px-6 py-3">
                                {data.UserType}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                User Name
                            </div>
                            <div className="flex-grow rounded-r-lg border px-6 py-3">
                                {data.UserName}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                        {data.IPAddress && (
                            <div className="flex">
                                <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                    IP Address
                                </div>
                                <div className="flex-grow rounded-r-lg border px-6 py-3">
                                    {data.IPAddress}
                                </div>
                            </div>
                        )}
                        <div className="flex">
                            <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                Current Login Time
                            </div>
                            <div className="flex-grow rounded-r-lg border px-6 py-3">
                                {formatDate(data.CurrentLoginDateTime)}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                Previous Login Time
                            </div>
                            <div className="flex-grow rounded-r-lg border px-6 py-3">
                                {formatDate(data.LastLoginDateTime)}
                            </div>
                        </div>
                        {data.CollegeName && data.CollegeName.trim() !== "" && (
                            <div className="flex">
                                <div className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                    College Name
                                </div>
                                <div className="flex-grow rounded-r-lg border px-6 py-3">
                                    {data.CollegeName}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>

            {/* Renders if UserType is 'Secretary' */}
            {isSecretary && (
                <PendencyStatusDashboard
                    data={pendencyData}
                    loading={pendencyLoading}
                />
            )}

            {/* Renders if UserType is 'District' */}
            {isDistrict && (
                <CandidateApprovalDashboard
                    data={districtData}
                    loading={districtLoading}
                />
            )}
        </div>
    );
};

export default Dashboard;