import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import agent from "../lib/api/agent";
import PaddedLayout from "../Component/Context/ReactComponent";
import MandatoryTaskPopup from "../Component/formcomponent/MandatoryTaskPopup";

import InstitutesUnderInquiry from "../Component/Institute/InstitutesUnderInquiry";
import InstituteDashboard from "../Component/Institute/Dashboard/DashboardInstitute";

import Specification from "../Component/ITISpecification/Specification";
//import TradeRequirements from "../Component/ITISpecification/TradeRequirements";
//import RequirementSummaryPage from "../Component/ITISpecification/RequirementSummaryPage";
import TradeRequirements from "../Component/ITISpecification/TradeRequirements_new";
//import Trade from "../Component/ITISpecification/Trade";
import Trade from "../Component/ITISpecification/Trade_New";
import CourseWiseRequirement from "../Component/ITISpecification/CourseWiseRequirement";
//import GreenFieldRequirement from "../Component/ITISpecification/GreenFieldRequirement";

import DPDCFunds from "../Component/ITISpecification/DPDCFunds_new";
//import DPDCFunds from "../Component/ITISpecification/DPDCFunds";  -- use this route for old DPDC Funds Component
import PPPFunds from "../Component/ITISpecification/PPPFunds_new";
//import PPPFunds from "../Component/ITISpecification/PPPFunds";   -- use this route for old PPP Funds Component
import SuccessStoriesForInstitute from "../Component/Institute/SuccessStories";

import { GetIsGovCollege } from "../Endpoints_All/Base/Institute";
import Management from "../Component/Institute/InstituteProfile/Management";
import PromotingOrganization from "../Component/Institute/InstituteProfile/PromotingOrganization";
import Promoters from "../Component/Institute/InstituteProfile/Promoters";
import InstituteProfile from "../Component/Institute/InstituteProfile/InstituteProfile";
import Courses from "../Component/Institute/InstituteProfile/Courses";
import NationalCourse from "../Component/Institute/InstituteProfile/NationalTradeCourse";
import SchoolsTable from "../Component/SchoolStep/SchoolsTable";
import SchoolsPage from "../pages/SchoolStep/SchoolsPage";
import AddSchoolForm from "../Component/SchoolStep/AddSchoolForm";
import CoursesTable from "../Component/SchoolStep/CoursesTable";
import ActiveBatch from "../Component/SchoolStep/ActiveBatch";
import ApprovedCourseList from "../Component/SchoolStep/ApprovedCourseList";
import RegisterCandidates from "../Component/SchoolStep/RegisterCandidates";
import BatchDetails from "../Component/Admission/BatchDetails";
import SecurityDeposite from "../Component/NewInstituteApprovalProcess/InstituteProfile/SecurityDeposite";
import SecurityDepositeReguler from "../Component/NewInstituteApprovalProcess/InstituteProfile/SecurityDepositeReguler";
import SuccessStoriesPublish from "../pages/Secretary/SuccessStoriesPublish";
import SuccessStories from "../Component/Institute/SuccessStories";

import GreenFieldRequirement from "../Component/ITISpecification/GreenFieldRequirement";

// Protected Route Component
const ProtectedGovRoute = ({ children, isGovCollege, loading }) => {
  if (loading) {
    return (
      <PaddedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Checking access...</span>
        </div>
      </PaddedLayout>
    );
  }

  if (!isGovCollege) {
    return (
      <PaddedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <div className="text-red-600 text-xl font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-red-500 text-sm">
              This feature is only available for Government Colleges.
            </div>
          </div>
        </div>
      </PaddedLayout>
    );
  }

  return children;
};

function InstituteRoutes({
  userLoginId,
  instituteId,
  userTypeId,
  isLoggedIn,
  onLoginStateChange,
}) {
  const [isGovCollege, setIsGovCollege] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGovCollegeStatus = async () => {
      if (!userLoginId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await agent.get(GetIsGovCollege, {
          params: {
            CollegeID: 1,
            UserLoginID: userLoginId,
          },
          headers: {
            accept: "*/*",
          },
        });

        if (
          response.data.Status === "Success" &&
          response.data.Data?.length > 0
        ) {
          const status = response.data.Data[0].IsGovCollege;
          setIsGovCollege(status === 1);
        } else {
          setIsGovCollege(false);
        }
      } catch (error) {
        setIsGovCollege(false);
      } finally {
        setLoading(false);
      }
    };

    checkGovCollegeStatus();
  }, [userLoginId]);

  return (
    <>
      <MandatoryTaskPopup userLoginId={userLoginId} userTypeId={userTypeId} />

      <Routes>
        <Route
          path="dashboard"
          element={
            <PaddedLayout>
              <InstituteDashboard
                userLoginID={userLoginId}
                isLoggedIn={isLoggedIn}
                onLoginStateChange={onLoginStateChange}
              />
            </PaddedLayout>
          }
        />

        <Route
          path="under-inquiry"
          element={
            <PaddedLayout>
              <InstitutesUnderInquiry />
            </PaddedLayout>
          }
        />
        <Route
          path="Management"
          element={
            <PaddedLayout>
              <Management />
            </PaddedLayout>
          }
        />
        <Route
          path="PromotingOrganization"
          element={
            <PaddedLayout>
              <PromotingOrganization />
            </PaddedLayout>
          }
        />
        <Route
          path="Promoters"
          element={
            <PaddedLayout>
              <Promoters />
            </PaddedLayout>
          }
        />
        <Route
          path="InstituteProfile"
          element={
            <PaddedLayout>
              <InstituteProfile />
            </PaddedLayout>
          }
        />
        {/*<Route*/}
        {/*  path="Courses"*/}
        {/*  element={*/}
        {/*    <PaddedLayout>*/}
        {/*      <Courses />*/}
        {/*    </PaddedLayout>*/}
        {/*  }*/}
        {/*    />*/}

        <Route
          path="Courses"
          element={
            <PaddedLayout>
              <NationalCourse />
            </PaddedLayout>
          }
        />

        {/* SchoolStep Route */}
        <Route
          path="SchoolStep"
          element={
            <PaddedLayout>
              <SchoolsPage />
            </PaddedLayout>
          }
        />
        <Route
          path="SchoolStep/add"
          element={
            <PaddedLayout>
              <AddSchoolForm />
            </PaddedLayout>
          }
        />
        <Route
          path="SchoolStep/courses/:schoolId"
          element={
            <PaddedLayout>
              <CoursesTable />
            </PaddedLayout>
          }
        />
        <Route
          path="SchoolStep/:schoolId"
          element={
            <PaddedLayout>
              <SchoolsTable />
            </PaddedLayout>
          }
        />
        <Route
          path="Batches"
          element={
            <PaddedLayout>
              <ActiveBatch />
            </PaddedLayout>
          }
        />

        <Route
          path="Approvedcourses"
          element={
            <PaddedLayout>
              <ApprovedCourseList />
            </PaddedLayout>
          }
        />

        <Route
          path="RegisterCandidates"
          element={
            <PaddedLayout>
              <RegisterCandidates />
            </PaddedLayout>
          }
        />

        {/* Protected Routes - Only for Government Colleges */}
        <Route
          path="Trade"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <Trade />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />

        <Route
          path="Specification"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <Specification />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />

        <Route
          path="DPDCFunds"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <DPDCFunds />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />

        <Route
          path="PPPFunds"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <PPPFunds />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />

        <Route
          path="Requirement"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <TradeRequirements />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />

        <Route
          path="SuccessStories"
          element={
            <PaddedLayout>
              <SuccessStoriesForInstitute />
            </PaddedLayout>
          }
        />
        <Route
          path="CourseWiseRequirement"
          element={
            <PaddedLayout>
              <CourseWiseRequirement />
            </PaddedLayout>
          }
        />
        {/* <Route
          path="GreenFieldRequirement"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <GreenFieldRequirement/>
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        /> */}
        <Route
          path="BatchDetails"
          element={
            <PaddedLayout>
              <BatchDetails />
            </PaddedLayout>
          }
        />
        <Route
          path="SecurityDeposite"
          element={
            <PaddedLayout>
              <SecurityDeposite />
            </PaddedLayout>
          }
        />
        <Route
          path="InstituteCode"
          element={
            <PaddedLayout>
              <SecurityDepositeReguler />
            </PaddedLayout>
          }
        />

        <Route
          path="SuccessStoriesPublish"
          element={
            <PaddedLayout>
              <SuccessStoriesPublish />
            </PaddedLayout>
          }
        />

        <Route
          path="SuccessStories"
          element={
            <PaddedLayout>
              <SuccessStories />
            </PaddedLayout>
          }
        />

        <Route
          path="GreenFieldRequirement"
          element={
            <ProtectedGovRoute isGovCollege={isGovCollege} loading={loading}>
              <PaddedLayout>
                <GreenFieldRequirement />
              </PaddedLayout>
            </ProtectedGovRoute>
          }
        />
      </Routes>
    </>
  );
}

export default InstituteRoutes;
