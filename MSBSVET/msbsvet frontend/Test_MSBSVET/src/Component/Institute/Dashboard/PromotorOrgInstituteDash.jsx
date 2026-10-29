import { FaSitemap, FaUser, FaGlobe, FaFile } from "react-icons/fa";
import { usePromotorOrgDashboardDetails } from "../../../lib/hooks/usePromoterRegistrationMutation";
import { getVerificationIconComponent, getFormStatusText } from "../../../utils/CommonHelper";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const PromotorOrgInstituteDashboard = ({ userDetails }) => {
    const promotorUserID = userDetails?.UserID || userDetails?.UserId;

    const {
        data,
        isLoading,
        isError,
        error,
    } = usePromotorOrgDashboardDetails(promotorUserID);

    const statusRows = data?.Data?.Table ?? [];

    const counts = useMemo(() => {
        const row = data?.Data?.Table1?.[0];
        if (!row) {
            return {
                PromotingOrganization: 0,
                AssociatedInstitutes: 0,
                PromotersDetails: 0,
            };
        }

        return {
            PromotingOrganization: Number(row.PromotingOrganization) > 0 ? 100 : 0,
            AssociatedInstitutes: Number(row.AssociatedInstitutes) > 0 ? 100 : 0,
            PromotersDetails: Number(row.PromotersDetails) > 0 ? 100 : 0,
        };
    }, [data]);


    const statusByTable = useMemo(() => {
        if (!statusRows) return {};

        return statusRows.reduce((acc, row) => {
            acc[row.TableName] = row;
            return acc;
        }, {});
    }, [statusRows]);

    const verificationStatus = useMemo(() => {
        const row = data?.Data?.Table2?.[0];
        return getFormStatusText(row?.FormStatus);
    }, [data]);

    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    if (isError) {
        return <div>Failed to load dashboard</div>;
    }

    if (!data) {
        return <div>No dashboard data</div>;
    }
    
    const cards = [
        {
            title: "Promoting Organization",
            count: counts.PromotingOrganization,
            tableName: "PromotingOrganization",
            icon: <FaSitemap size={40} />,
            bgColor: "bg-[#91CF76]",
            link: "/promotingorganization/profile",
        },
        {
            title: "Promoter/s",
            count: counts.PromotersDetails,
            tableName: "PromoterStaff",
            icon: <FaUser size={40} />,
            bgColor: "bg-[#DCE8F4]",
            link: "/promotingorganization/PromotersDetails",
        },
        {
            title: "Associated Institute/s",
            count: counts.AssociatedInstitutes,
            tableName: "AssociatedInstitute",
            icon: <FaGlobe size={40} />,
            bgColor: "bg-[#D581B4]",
            link: "/promotingorganization/AssociatedInstitutes",
        },
        {
            title: "Verification Status",
            count: verificationStatus,
            tableName: "Overall",
            icon: <FaFile size={40} />,
            bgColor: "bg-[#DCE8F4]",
            link: "/promotingorganization/Summary",
        },
    ];

    return (
        <div className="w-full p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                    const row = statusByTable[card.tableName];

                    const statusIcon = getVerificationIconComponent(
                        row?.StatusParam,
                        row?.ValidColumnCount
                    );

                    return (
                        <Link
                            key={index}
                            to={card.link}
                            className={`flex w-full ${card.bgColor}
            rounded-lg shadow hover:shadow-lg transition-all`}
                        >
                            <div className="flex flex-col justify-between p-4 w-full">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {card.icon}
                                        {statusIcon}
                                    </div>

                                    <h3 className="text-2xl font-bold">
                                        {card.count}
                                    </h3>
                                </div>

                                <div className="mt-3">
                                    <h6 className="text-lg font-semibold">
                                        {card.title}
                                    </h6>
                                    <small className="text-gray-600">
                                        Updated recently
                                    </small>
                                </div>
                            </div>
                        </Link>
                    );                    
                })}
            </div>
        </div>
    );
};

export default PromotorOrgInstituteDashboard;