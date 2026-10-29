import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faUniversity, faBook, faUsers, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import publicAgent from '../../lib/api/publicAgent';
import { useNavigate } from "react-router-dom";
import { GetHomeDashboard } from "../../Endpoints_All/StatisticsCards/StatisticsCards";

const StatisticsCards = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        Institute: "0",
        Course: "0",
        Candidate: "0",
        Sector: "0"
    });

    // State for all tables
    const [regionData, setRegionData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [sectorData, setSectorData] = useState([]);
    const [candidateData, setCandidateData] = useState([]);

    // State for drill-down functionality
    const [showDrillDown, setShowDrillDown] = useState(false);
    const [drillDownType, setDrillDownType] = useState("");
    const [drillDownData, setDrillDownData] = useState([]);
    const [drillDownTitle, setDrillDownTitle] = useState("");
    const [selectedRegionId, setSelectedRegionId] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [drillDownLoading, setDrillDownLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await publicAgent.get(GetHomeDashboard);

            if (response.data.Status === "Success" && response.data.Data) {
                const data = response.data.Data;

                // Set dashboard cards data from Table
                if (data.Table && data.Table.length > 0) {
                    setDashboardData(data.Table[0]);
                }

                // Store all table data
                setRegionData(data.Table1 || []);
                setDistrictData(data.Table2 || []);
                setSectorData(data.Table3 || []);
                setCandidateData(data.Table4 || []);
            }
        } catch (error) {
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Handle card clicks for drill-down functionality
    const handleInstituteCardClick = () => {
        setDrillDownData(regionData);
        setDrillDownType("region");
        setDrillDownTitle("Region Wise Institute");
        setShowDrillDown(true);
    };

    const handleSectorCardClick = () => {
        setDrillDownData(sectorData);
        setDrillDownType("sector");
        setDrillDownTitle("Sector Wise Courses");
        setShowDrillDown(true);
    };

    const handleCandidateCardClick = () => {
        setDrillDownData(candidateData);
        setDrillDownType("candidate");
        setDrillDownTitle("Candidate Statistics");
        setShowDrillDown(true);
    };

    // Handle region click to show districts
    const handleRegionClick = (regionId, regionName) => {
        const filteredDistricts = districtData.filter(district => district.RegionID === regionId);
        setDrillDownData(filteredDistricts);
        setDrillDownType("district");
        setDrillDownTitle(`District Wise Institute - ${regionName}`);
        setSelectedRegionId(regionId);
    };

    // Handle district click to redirect to institutes page
    const handleDistrictClick = (regionId, districtId) => {
        navigate(`/Public/institutes?P1=${regionId}&P2=${districtId}`);
    };

    // Handle sector click to redirect to courses page
    const handleSectorClick = (sectorId) => {
        navigate(`/Public/courses?P1=${sectorId}`);
    };

    // Close drill-down view
    const closeDrillDown = () => {
        setShowDrillDown(false);
        setDrillDownData([]);
        setSelectedRegionId(null);
    };

    // Go back to previous level (districts to regions)
    const goBackToPreviousLevel = () => {
        if (drillDownType === "district") {
            handleInstituteCardClick();
        }
    };

    const stats = [
        {
            icon: <FontAwesomeIcon icon={faUniversity} style={{ color: "#e48c11", fontSize: "2rem" }} />,
            value: loading ? "Loading..." : dashboardData.Institute,
            label: t("Institutes"),
            onClick: () => !loading && handleInstituteCardClick()
        },
        {
            icon: <FontAwesomeIcon icon={faChartPie} style={{ color: "#ce752c", fontSize: "2rem" }} />,
            value: loading ? "Loading..." : dashboardData.Sector,
            label: t("Sectors"),
            onClick: () => !loading && handleSectorCardClick()
        },

        {
            icon: <FontAwesomeIcon icon={faBook} style={{ color: "#d7830f", fontSize: "2rem" }} />,
            value: loading ? "Loading..." : dashboardData.Course,
            label: t("Courses"),
            onClick: () => navigate("/Public/courses")
        },
        {
            icon: <FontAwesomeIcon icon={faUsers} style={{ color: "#da7c10", fontSize: "2rem" }} />,
            value: loading ? "Loading..." : dashboardData.Candidate,
            label: t("Candidates"),
            onClick: () => !loading && handleCandidateCardClick()
        },
    ];

    const renderDrillDownTable = () => {
        if (!showDrillDown || drillDownData.length === 0) return null;

        return (
            <div className="mt-8 bg-white rounded-lg shadow-lg">
                <div className="bg-gray-100 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{drillDownTitle}</h3>
                    <div className="flex items-center gap-3">
                        {drillDownType === "district" && (
                            <button
                                onClick={goBackToPreviousLevel}
                                className="text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium"
                            >
                                ← Back to Regions
                            </button>
                        )}
                        <button
                            onClick={closeDrillDown}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {drillDownLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <span className="ml-3 text-gray-600">Loading...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Sr. No.</th>

                                        {drillDownType === 'region' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Government</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Non-Government</th>
                                            </>
                                        )}

                                        {drillDownType === 'district' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Government</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Non-Government</th>
                                            </>
                                        )}

                                        {drillDownType === 'sector' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">No. Of Courses</th>
                                            </>
                                        )}

                                        {drillDownType === 'candidate' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Admitted Candidates</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Training Completed</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Ongoing Training</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drillDownData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="border border-gray-300 px-4 py-3 text-center font-medium">{index + 1}.</td>

                                            {drillDownType === 'region' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3">
                                                        <button
                                                            onClick={() => handleRegionClick(item.RegionID, item.Region)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                                                        >
                                                            {item.Region}
                                                        </button>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-700">{item.GovtInst}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">{item.PvtInst}</td>
                                                </>
                                            )}

                                            {drillDownType === 'district' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3">
                                                        <button
                                                            onClick={() => handleDistrictClick(selectedRegionId, item.DistrictID)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                                                        >
                                                            {item.District}
                                                        </button>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-700">{item.GovtInst}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">{item.PvtInst}</td>
                                                </>
                                            )}

                                            {drillDownType === 'sector' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3">
                                                        <button
                                                            onClick={() => handleSectorClick(item.SectorID)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                                                        >
                                                            {item.Sector}
                                                        </button>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-orange-700">{item.Courses}</td>
                                                </>
                                            )}

                                            {drillDownType === 'candidate' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">{item.Admitted}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-green-700">{item.TraningCompleted}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-orange-700">{item.TraningonGoing}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 font-semibold mb-2">Error Loading Dashboard</div>
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchDashboardData();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Statistics Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className={`p-6 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${stat.onClick && !loading ? 'cursor-pointer' : ''
                            }`}
                        onClick={stat.onClick && !loading ? stat.onClick : undefined}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            {stat.icon}
                            <h2 className="text-4xl font-bold text-gray-800">{stat.value}</h2>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </section>

            {/* Drill-down Table */}
            <div className="p-4">
                {renderDrillDownTable()}
            </div>
        </>
    );
};

export default StatisticsCards;
