

import React, { useState, useEffect } from 'react';
import { DashboardContext } from './DashboardContext';
import agent from '../lib/api/agent';
import { GetTempInstituteDashboard } from '../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess';
import { GetInstituteIDByInstituteCode } from "../Endpoints_All/Base/Institute";
import { userDetailsAPI } from '../Endpoints_All/Account/userManagement';
import { useAuth } from '../Hooks/AuthContext';

const defaultData = {
    UserLoginID: '',
    UserType: '',
    UserName: '',
    IPAddress: '',
    CurrentLoginDateTime: '',
    LastLoginDateTime: '',
    CollegeName: ''
};

export const DashboardProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState({});
    const [instituteID, setInstituteID] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     const {userInfo} = useAuth();

    useEffect(() => {
        fetchDashboardData();

    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // =========================
            // USER INFO
            // =========================
            const userTypeID = userInfo?.UserTypeID || "";
            const userLoginID = userInfo?.UserLoginID || "";

            // =========================
            // GET INSTITUTE ID
            // =========================
            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`
            );

            let instituteId = null;

            if (resInstitute?.data?.Data) {
                instituteId = resInstitute.data.Data;
                setInstituteID(instituteId);
            } else {
                setError("Unable to fetch Institute ID");
                setLoading(false);
                return;
            }

            
            const [userDetailsResponse, instituteDashResponse] = await Promise.all([
                agent.get(`${userDetailsAPI}?userTypeId=${userTypeID}&userLoginId=${userLoginID}`),
                agent.get(`${GetTempInstituteDashboard}?tempInstituteId=${instituteId}`),
            ]);

            
            const userData = userDetailsResponse?.data?.[0] || defaultData;

           
            const rawData = instituteDashResponse?.data?.Data || [];

            // Data[0] => 18 page objects
            const pageArray = Array.isArray(rawData[0]) ? rawData[0] : [];

            const loiStatusArray = Array.isArray(rawData[1]) ? rawData[1] : [];
            const loiStatus = loiStatusArray[0] || {};

            
            const getPageData = (pageCode) => {
               
                const page = pageArray.find((x) => x.PageCode === pageCode);

                if (!page) {
                    return {
                        percentage: 0,
                        verified: false,
                        verifyStatus: 'N',
                        displayType: 'Pending',
                        bgColor: '#f3f4f6',
                        pageName: '',
                        pageURL: '',
                        pageCode: pageCode,
                        icon: '',
                        pageId: null,
                    };
                }

                return {
                    percentage: page.PercentageStatus || 0,
                    verified: page.VerifyStatus === 'V',
                    verifyStatus: page.VerifyStatus || 'N',
                    displayType: page.DisplayType || 'Pending',
                    bgColor: page.BGColur || '#f3f4f6',
                    pageName: page.PageNameDisplay || '',
                    pageURL: page.PageURL || '',
                    pageCode: page.PageCode || '',
                    icon: page.VerifyStatus === 'V' ? '/images/verified.png' : '',
                    pageId: page.PageId || null,
                    anchorTarget: page.AnchorTagTarget || '_self',
                };
            };

            
            const loiGenerationPage = pageArray[6] || {};
            const loiLetterPage = pageArray[7] || {};

            const buildPageObj = (page) => ({
                percentage: page.PercentageStatus || 0,
                verified: page.VerifyStatus === 'V',
                verifyStatus: page.VerifyStatus || 'N',
                displayType: page.DisplayType || 'Pending',
                bgColor: page.BGColur || '#f3f4f6',
                pageName: page.PageNameDisplay || '',
                pageURL: page.PageURL || '',
                pageCode: page.PageCode || '',
                icon: page.VerifyStatus === 'V' ? '/images/verified.png' : '',
                pageId: page.PageId || null,
                anchorTarget: page.AnchorTagTarget || '_self',
            });

           
            const mappedData = {
                // ---- User Info ----
                userLoginID: userData.UserLoginID || '',
                ipAddress: userData.IPAddress || '',
                userType: userData.UserType || '',
                currentLoginDateTime: userData.CurrentLoginDateTime || '',
                userName: userData.UserName || '',
                lastLoginDateTime: userData.LastLoginDateTime || '',
                welcomeMessage: `Welcome ${userData.UserName || 'User'}`,
                dashboardHeading: 'Institute Dashboard',

                // ---- LoI Stage Steps ----
                InstitutePayment: getPageData('InstitutePayment'),
                PromotingOrganization: getPageData('PromotingOrganization'),
                PromotersDetails: getPageData('PromotersDetails'),
                ProposedInstituteDetails: getPageData('ProposedInstituteDetails'),
                ProposedCourse: getPageData('ProposedCourse'),
                SelfDeclaration: getPageData('SelfDeclaration'),
                LOIGeneration: buildPageObj(loiGenerationPage),   // "Application for LoI"
                LOI: buildPageObj(loiLetterPage),                 // "Letter of Intent (LoI)"

                // ---- Inspection Stage Steps ----
                UnitforInspection: getPageData('UnitforInspection'),
                BuildingDetails: getPageData('BuildingDetails'),
                LandDetails: getPageData('LandDetails'),
                WorkshopDetails: getPageData('WorkshopDetails'),
                TrainingEquipmentDetails: getPageData('TrainingEquipmentDetails'),
                CommonFacilityDetails: getPageData('CommonFacilityDetails'),
                PowerDetails: getPageData('PowerDetails'),
                InstituteBank: getPageData('InstituteBank'),
                InspectionFee: getPageData('InspectionFee'),
                InspectionRequest: getPageData('InspectionRequest'),

                // ---- LoI Issued Status (from Data[1]) ----
                // 'V' = Issued (show Inspection Stage), 'N' = Not issued (hide it)
                isLoIIssued: loiStatus.LoIIssued || 'N',

                // ---- Raw Data ----
                pageArray,
                loiStatus,
                instituteID: instituteId,
            };

            setDashboardData(mappedData);

        } catch (error) {
            setError(error?.message || "Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const updateStepPercentage = (stepKey, percentage) => {
        setDashboardData(prev => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], percentage }
        }));
    };

    return (
        <DashboardContext.Provider value={{
            dashboardData,
            instituteID,
            loading,
            error,
            updateStepPercentage,
            refreshDashboard: fetchDashboardData
        }}>
            {children}
        </DashboardContext.Provider>
    );
};
