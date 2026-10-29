// pages/DashboardTInstitute.jsx
import React, { useState, useEffect, useContext } from 'react';
import { DashboardProvider, DashboardContext } from '../contexts/DashboardContext';
import UserInfoSection from '../components/dashboard/UserInfoSection';
import ProgressStepper from '../components/dashboard/ProgressStepper';
import StepCardsGrid from '../components/dashboard/StepCardsGrid';
import Modal from '../components/common/Modal';

const DashboardTInstituteContent = () => {
    const { dashboardData, loading } = useContext(DashboardContext);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', text: '' });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (dashboardData.displayPopup && dashboardData.popupText?.length > 0) {
            setModalContent({
                title: dashboardData.popupHeader || 'Notification',
                text: dashboardData.popupText
            });
            setShowModal(true);
        }
    }, [dashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const stepGroups = [
        {
            title: 'Step 1',
            steps: [
                { key: 'InstitutePayment', label: 'Payment Transaction', color: 'bg-green-400', link: '/institute/payment' },
                { key: 'PromotingOrganization', label: 'Promoting Organization', color: 'bg-blue-200', link: '/institute/promoting-organization' },
                { key: 'PromotersDetails', label: 'Promoters', color: 'bg-pink-300', link: '/institute/promoters' },
                { key: 'ProposedInstituteDetails', label: 'Proposed Institute', color: 'bg-blue-200', link: '/institute/proposed-institute' },
                { key: 'ProposedCourse', label: 'Proposed Courses', color: 'bg-green-400', link: '/institute/proposed-courses' },
                { key: 'SelfDeclaration', label: 'Self-Declaration', color: 'bg-blue-200', link: '/institute/self-declaration' },
                { key: 'LOIGeneration', label: 'Application for Letter of Intent (LoI)', color: 'bg-pink-300', link: '/institute/loi-generation' },
                { key: 'DocumentScrutiny', label: 'Document Scrutiny Scheduled', color: 'bg-blue-200', link: '/institute/document-scrutiny' }
            ]
        },
        {
            title: 'Step 2',
            steps: [
                { key: 'LOI', label: 'Letter of Intent (LoI)', color: 'bg-green-400', link: '/institute/loi' },
                { key: 'LOR1', label: 'Letter of Rejection(LoR)', color: 'bg-blue-200', link: '/institute/lor' }
            ]
        },
        {
            title: 'Step 3',
            steps: [
                { key: 'BuildingDetails', label: 'Building', color: 'bg-green-400', link: '/institute/building' },
                { key: 'LandDetails', label: 'Land', color: 'bg-blue-200', link: '/institute/land' },
                { key: 'WorkshopDetails', label: 'Workshop', color: 'bg-pink-300', link: '/institute/workshop' },
                { key: 'TrainingEquipmentDetails', label: 'Training Equipment', color: 'bg-blue-200', link: '/institute/training-equipment' },
                { key: 'CommonFacilityDetails', label: 'Common Facility', color: 'bg-green-400', link: '/institute/common-facility' },
                { key: 'PowerDetails', label: 'Power', color: 'bg-blue-200', link: '/institute/power' },
                { key: 'OtherInfraDetails', label: 'Other Infrastructure', color: 'bg-pink-300', link: '/institute/other-infra' },
                { key: 'InstituteBank', label: 'Bank Account', color: 'bg-blue-200', link: '/institute/bank' },
                { key: 'InspectionFee', label: 'Inspection Fees', color: 'bg-green-400', link: '/institute/inspection-fee' },
                { key: 'InspectionRequest', label: 'Request for Inspection', color: 'bg-blue-200', link: '/institute/inspection-request' }
            ]
        },
        {
            title: 'Step 4',
            steps: [
                { key: 'InspectionReport', label: 'Inspection Report', color: 'bg-green-400', link: '/institute/inspection-report' }
            ]
        },
        {
            title: 'Step 5',
            steps: [
                { key: 'LOA', label: 'Letter of Approval(LoA)', color: 'bg-green-400', link: '/institute/loa' },
                { key: 'LOR2', label: 'Letter of Rejection(LoR)', color: 'bg-blue-200', link: '/institute/lor2' }
            ]
        },
        {
            title: 'Step 6',
            steps: [
                { key: 'StaffDetails', label: 'Staff Details', color: 'bg-green-400', link: '/institute/staff' },
                { key: 'SecurityDeposit', label: 'Security Deposit', color: 'bg-blue-200', link: '/institute/security-deposit' }
            ]
        },
        {
            title: 'Step 7',
            steps: [
                { key: 'AffiliationOrder', label: 'Affiliation Order', color: 'bg-green-400', link: '/institute/affiliation' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {showWelcome && (
                <UserInfoSection
                    userInfo={{
                        loginId: dashboardData.userLoginID,
                        ipAddress: dashboardData.ipAddress,
                        userType: dashboardData.userType,
                        currentLoginDateTime: dashboardData.currentLoginDateTime,
                        userName: dashboardData.userName,
                        lastLoginDateTime: dashboardData.lastLoginDateTime,
                        welcomeMessage: dashboardData.welcomeMessage
                    }}
                />
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {dashboardData.dashboardHeading || 'Institute Dashboard'}
                </h2>

                <ProgressStepper
                    steps={[
                        {
                            key: 'RegistrationFee', label: dashboardData.registrationFeeHeading || 'Registration Fee',
                            percentage: dashboardData.InstitutePayment || 0, link: '/institute/payment'
                        },
                        {
                            key: 'PromotingOrganization', label: dashboardData.promotingOrganizationHeading || 'Promoting Organization',
                            percentage: dashboardData.PromotingOrganization || 0, link: '/institute/promoting-organization'
                        },
                        {
                            key: 'Promoters', label: dashboardData.promotersHeading || 'Promoters',
                            percentage: dashboardData.PromotersDetails || 0, link: '/institute/promoters'
                        },
                        {
                            key: 'ProposedInstitute', label: dashboardData.proposedInstituteHeading || 'Proposed Institute',
                            percentage: dashboardData.ProposedInstituteDetails || 0, link: '/institute/proposed-institute'
                        },
                        {
                            key: 'ProposedCourse', label: dashboardData.proposedCourseHeading || 'Proposed Course',
                            percentage: dashboardData.ProposedCourse || 0, link: '/institute/proposed-courses'
                        },
                        {
                            key: 'SelfDeclaration', label: dashboardData.selfDeclarationHeading || 'Self Declaration',
                            percentage: dashboardData.SelfDeclaration || 0, link: '/institute/self-declaration'
                        },
                        {
                            key: 'LOIGeneration', label: dashboardData.loiGenerationHeading || 'LOI Generation',
                            percentage: dashboardData.LOIGeneration || 0, link: '/institute/loi-generation'
                        },
                        {
                            key: 'BuildingDetails', label: dashboardData.buildingDetailsHeading || 'Building Details',
                            percentage: dashboardData.BuildingDetails || 0, link: '/institute/building'
                        },
                        {
                            key: 'LandDetails', label: dashboardData.landDetailsHeading || 'Land Details',
                            percentage: dashboardData.LandDetails || 0, link: '/institute/land'
                        },
                        {
                            key: 'WorkshopDetails', label: dashboardData.workshopDetailsHeading || 'Workshop Details',
                            percentage: dashboardData.WorkshopDetails || 0, link: '/institute/workshop'
                        },
                        {
                            key: 'TrainingEquipment', label: dashboardData.trainingEquipmentHeading || 'Training Equipment',
                            percentage: dashboardData.TrainingEquipmentDetails || 0, link: '/institute/training-equipment'
                        },
                        {
                            key: 'CommonFacility', label: dashboardData.commonFacilityHeading || 'Common Facility',
                            percentage: dashboardData.CommonFacilityDetails || 0, link: '/institute/common-facility'
                        },
                        {
                            key: 'PowerDetails', label: dashboardData.powerDetailsHeading || 'Power Details',
                            percentage: dashboardData.PowerDetails || 0, link: '/institute/power'
                        },
                        {
                            key: 'OtherInfra', label: dashboardData.otherInfraHeading || 'Other Infrastructure',
                            percentage: dashboardData.OtherInfraDetails || 0, link: '/institute/other-infra'
                        },
                        {
                            key: 'InstituteBank', label: dashboardData.instituteBankHeading || 'Institute Bank',
                            percentage: dashboardData.InstituteBank || 0, link: '/institute/bank'
                        },
                        {
                            key: 'InspectionFee', label: dashboardData.inspectionFeeHeading || 'Inspection Fee',
                            percentage: dashboardData.InspectionFee || 0, link: '/institute/inspection-fee'
                        },
                        {
                            key: 'InspectionRequest', label: dashboardData.inspectionRequestHeading || 'Inspection Request',
                            percentage: dashboardData.InspectionRequest || 0, link: '/institute/inspection-request'
                        },
                        {
                            key: 'GovtApproval', label: dashboardData.govtApprovalHeading || 'Govt Approval',
                            percentage: dashboardData.GovtApproval || 0, link: '/institute/govt-approval'
                        }
                    ]}
                />
            </div>

            {stepGroups.map((group, index) => (
                <StepCardsGrid
                    key={index}
                    title={group.title}
                    steps={group.steps}
                    percentages={dashboardData}
                />
            ))}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalContent.title}
            >
                <div className="text-justify max-h-72 overflow-auto">
                    {modalContent.text}
                </div>
            </Modal>
        </div>
    );
};

const DashboardTInstitute = () => {
    return (
        <DashboardProvider>
            <DashboardTInstituteContent />
        </DashboardProvider>
    );
};

export default DashboardTInstitute;