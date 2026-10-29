import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import agent from '../../lib/api/agent';
import { useNavigate } from 'react-router-dom';
import {
    FaUniversity,
    FaChartPie,
    FaBook,
    FaUserGraduate,
    FaUser,
    FaUsers
} from "react-icons/fa";
import { GetHomeSTTDashboard } from '../../Endpoints_All/ITIShortTermTraining/ITIShortTermTraining';

const DashboardComponent = () => {
    const { t } = useTranslation(); // ✅ Add i18n
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);

    // Drill-down states
    const [showDrillDown, setShowDrillDown] = useState(false);
    const [drillDownData, setDrillDownData] = useState([]);
    const [drillDownType, setDrillDownType] = useState('');
    const [drillDownTitle, setDrillDownTitle] = useState('');
    const [drillDownLoading, setDrillDownLoading] = useState(false);
    const [selectedRegionId, setSelectedRegionId] = useState(null);
    const [selectedRegionName, setSelectedRegionName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await agent.get(GetHomeSTTDashboard, {
                headers: {
                    'X-API-KEY': 'qwertyuioplkjhgfdszxcvbnmjuytrewsdfghjvcdrtyh'
                }
            });

            if (response.data.Status === 'Success') {
                setDashboardData(response.data.Data);
            } else {
                setError(t('Error_Loading_Dashboard'));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Navigation handlers
    const handleSearchCourse = () => {
        navigate('/Public/coursesSTT');
    };

    // Drill-down handlers
    const handleInstituteCardClick = () => {
        setDrillDownType('region');
        setDrillDownTitle(t('Region_Wise_Institute'));
        setDrillDownData(dashboardData?.Table1 || []);
        setShowDrillDown(true);
        setSelectedCard('institutes');
    };

    const handleSectorCardClick = () => {
        setDrillDownType('sector');
        setDrillDownTitle(t('Sector_Wise_Courses'));
        setDrillDownData(dashboardData?.Table3 || []);
        setShowDrillDown(true);
        setSelectedCard('sectors');
    };

    const handleRegisteredCardClick = () => {
        setDrillDownType('registered');
        setDrillDownTitle(t('Registered_Candidate'));
        const registeredData = [
            { Category: t('Male'), Count: dashboardData?.Table4?.[0]?.Male || 0 },
            { Category: t('Female'), Count: dashboardData?.Table4?.[0]?.Female || 0 },
            { Category: t('PWD'), Count: dashboardData?.Table4?.[0]?.PWD || 0 }
        ];
        setDrillDownData(registeredData);
        setShowDrillDown(true);
        setSelectedCard('registered');
    };

    const handleAdmittedCardClick = () => {
        setDrillDownType('admitted');
        setDrillDownTitle(t('Admitted_Candidate'));
        const admittedData = [
            { Category: t('Male'), Count: dashboardData?.Table6?.[0]?.Male || 0 },
            { Category: t('Female'), Count: dashboardData?.Table6?.[0]?.Female || 0 },
            { Category: t('PWD'), Count: dashboardData?.Table6?.[0]?.PWD || 0 }
        ];
        setDrillDownData(admittedData);
        setShowDrillDown(true);
        setSelectedCard('admitted');
    };

    const handleTrainingCapacityClick = () => {
        setDrillDownType('training-capacity');
        setDrillDownTitle(t('Training_Capacity_Details'));
        setDrillDownData(dashboardData?.Table5 || []);
        setShowDrillDown(true);
        setSelectedCard('training-capacity');
    };

    const handleRegionClick = (regionId, regionName) => {
        setDrillDownLoading(true);
        setSelectedRegionId(regionId);
        setSelectedRegionName(regionName);

        const districtData = dashboardData?.Table2?.filter(district =>
            district.RegionID === regionId
        ) || [];

        setDrillDownType('district');
        setDrillDownTitle(`${regionName} - ${t('District_Wise_Institute')}`);
        setDrillDownData(districtData);
        setDrillDownLoading(false);
    };

    const handleDistrictClick = (regionId, districtId) => {
        navigate(`/Public/Institutes?P1=${regionId}&P2=${districtId}`);
    };

    const handleSectorClick = (sectorId) => {
        navigate(`/Public/Courses?P1=${sectorId}`);
    };

    const goBackToPreviousLevel = () => {
        setDrillDownType('region');
        setDrillDownTitle(t('Region_Wise_Institute'));
        setDrillDownData(dashboardData?.Table1 || []);
        setSelectedRegionId(null);
        setSelectedRegionName('');
    };

    const closeDrillDown = () => {
        setShowDrillDown(false);
        setDrillDownData([]);
        setDrillDownType('');
        setDrillDownTitle('');
        setSelectedCard(null);
        setSelectedRegionId(null);
        setSelectedRegionName('');
    };

    const handleCardClick = (cardType) => {
        if (cardType === 'courses') {
            handleSearchCourse();
        } else if (cardType === 'institutes') {
            handleInstituteCardClick();
        } else if (cardType === 'sectors') {
            handleSectorCardClick();
        } else if (cardType === 'registered') {
            handleRegisteredCardClick();
        } else if (cardType === 'admitted') {
            handleAdmittedCardClick();
        } else if (cardType === 'training-capacity') {
            handleTrainingCapacityClick();
        }
    };

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
                                {t('Back_to_Regions')}
                            </button>
                        )}
                        <button
                            onClick={closeDrillDown}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {(drillDownType === 'region') && (
                    <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-20 text-blue-800 font-semibold text-sm">
                            <div>{t('GITI')}: {dashboardData?.Table?.[0]?.GITI || 0}</div>
                            <div>{t('GTHS')}: {dashboardData?.Table?.[0]?.GTHS || 0}</div>
                            <div>{t('PITI')}: {dashboardData?.Table?.[0]?.PITI || 0}</div>
                        </div>
                    </div>
                )}

                {drillDownType === 'training-capacity' && (
                    <div className="bg-orange-50 px-6 py-3 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-6 text-orange-800 font-semibold text-sm">
                            <div>{t('Batches')}: {(dashboardData?.Table?.[0]?.GITI || 0) + (dashboardData?.Table?.[0]?.GTHS || 0) + (dashboardData?.Table?.[0]?.PITI || 0)}</div>
                            <div>{t('Courses')}: {dashboardData?.Table?.[0]?.Course || 0}</div>
                            <div>{t('Intake')}: {dashboardData?.Table?.[0]?.Intake || 0}</div>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {drillDownLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <span className="ml-3 text-gray-600">{t('Loading')}</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Sr_No')}</th>

                                        {drillDownType === 'region' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Region')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Government')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Non_Government')}</th>
                                            </>
                                        )}

                                        {drillDownType === 'district' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('District')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Government')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Non_Government')}</th>
                                            </>
                                        )}

                                        {drillDownType === 'sector' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Sector')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('No_Of_Courses')}</th>
                                            </>
                                        )}

                                        {(drillDownType === 'registered' || drillDownType === 'admitted') && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Category')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Count')}</th>
                                            </>
                                        )}

                                        {drillDownType === 'training-capacity' && (
                                            <>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Institute')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Course')}</th>
                                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">{t('Intake')}</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drillDownData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="border border-gray-300 px-4 py-3 text-center font-medium">{index + 1}</td>

                                            {drillDownType === 'region' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3">
                                                        <button
                                                            onClick={() => handleRegionClick(item.RegionID, item.Region)}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                                                            title={t('Region_Click_Message')}
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
                                                            title={t('District_Click_Message')}
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
                                                            title={t('Sector_Click_Message')}
                                                        >
                                                            {item.Sector}
                                                        </button>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-orange-700">{item.Courses}</td>
                                                </>
                                            )}

                                            {(drillDownType === 'registered' || drillDownType === 'admitted') && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3 font-medium">{item.Category}</td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-700">{item.Count}</td>
                                                </>
                                            )}

                                            {drillDownType === 'training-capacity' && (
                                                <>
                                                    <td className="border border-gray-300 px-4 py-3 text-sm">
                                                        <div className="whitespace-normal break-words">{item.Institute}</div>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-sm">
                                                        <div className="whitespace-normal break-words">{item.Course}</div>
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-orange-700">{item.Intake}</td>
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 font-semibold mb-2">{t('Error_Loading_Dashboard')}</div>
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchDashboardData();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {t('Retry')}
                    </button>
                </div>
            </div>
        );
    }

    const mainStats = dashboardData?.Table?.[0];

    const cardData = [
        {
            id: "institutes",
            title: t('Institutes'),
            value: mainStats?.Institute || 0,
            icon: <FaUniversity className="w-12 h-12" style={{ color: "#e48c11" }} />,
            color: "text-orange-500",
        },
        {
            id: "sectors",
            title: t('Sectors'),
            value: mainStats?.Sector || 0,
            icon: <FaChartPie className="w-12 h-12" style={{ color: "#ce752c" }} />,
            color: "text-orange-600",
        },
        {
            id: "courses",
            title: t('Courses'),
            value: mainStats?.Course || 0,
            icon: <FaBook className="w-12 h-12" style={{ color: "#d7830f" }} />,
            color: "text-orange-500",
        },
        {
            id: "training-capacity",
            title: t('Training_Capacity'),
            value: mainStats?.Intake || 0,
            icon: <FaUserGraduate className="w-12 h-12" style={{ color: "#da7c10" }} />,
            color: "text-orange-500",
        },
        {
            id: "registered",
            title: t('Registered'),
            value: mainStats?.Registered || 0,
            icon: <FaUser className="w-12 h-12" style={{ color: "#da7c10" }} />,
            color: "text-orange-500",
        },
        {
            id: "admitted",
            title: t('Admitted'),
            value: mainStats?.Admitted || 0,
            icon: <FaUsers className="w-12 h-12" style={{ color: "#da7c10" }} />,
            color: "text-orange-500",
        },
    ];

    return (
    <div className="bg-gray-50 p-6 pb-8">
            <div className="max-w-full mx-auto">
                {/* Header Stats Cards - Full Width */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {cardData.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`p-6 bg-white shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${selectedCard === card.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                                }`}
                        >
                            <div className="flex flex-col items-center space-y-3">
                                {card.icon}
                                <h2 className="text-4xl font-bold text-gray-800">{card.value.toLocaleString()}</h2>
                                <p className="text-gray-600 font-medium text-center">{card.title}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Drill-down Table */}
                <div className="w-full">
                    {renderDrillDownTable()}
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;