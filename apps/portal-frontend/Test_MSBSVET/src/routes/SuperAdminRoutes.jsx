// // SuperAdminRoutes.jsx - Routes for SuperAdmin users
// import { Routes, Route } from "react-router-dom";
// import PaddedLayout from "../Component/Context/ReactComponent";
// import SuperAdminDashboard from "../Component/SuperAdmin/Dashboard/DashboardSuperAdmin"; // TODO: Replace with actual SuperAdmin dashboard
// // import ManageActivityStatus from "../Component/SuperAdmin/Administration/ManageActivityStatus"; // TODO: Replace with actual component for managing activity status
// import ManageNotifications from "../Component/SuperAdmin/Administration/ManageNotifications";
// // import ManageProjectConfiguration from "../Component/SuperAdmin/Administration/ManageProjectConfiguration";
// // import ManageReports from "../Component/SuperAdmin/Administration/ManageReports";
// import ManageMenu from "../Component/SuperAdmin/Administration/MenuHome";
// // import ManageUsers from "../Component/SuperAdmin/Administration/ManageUsers";
// import UserDashboardPage from "../Component/CMS/Dashboard/Dashboard";
// // import ManageNotifications from "../pages/CMS/Administration/ManageNotifications";
// import BatchTransfer from "../pages/CMS/Admission/BatchTransfer";
// import ManageEvalutionSubscriptionStatus from "../Component/Examination/Exam/UnlockMarkSubmission";
// import ExamFees from "../pages/CMS/Exam/ExamFees";
// import ManageActivityStatus from "../pages/CMS/Exam/ManageActivityStatus";
// //import EditUserProfile from "../pages/CMS/Miscellaneous/EditUserProfile";
// import EditUserProfile from "../Component/Login/Miscellaneous/ChangeSecurityQuestion";
// import ManageReports from "../pages/SuperAdmin/Administration/ManageReports";
// import ManageProjectConfiguration from "../pages/SuperAdmin/Administration/ManageProjectConfiguration";
// // import ManageMenu from "../pages/SuperAdmin/Administration/MenuHome";
// import ResetApplicationVariables from "../pages/SuperAdmin/Administration/ResetApplicationVariables";
// import AdmissionDates from "../Component/Examination/Exam/AdmissionDates";
// import UnlockMarkSubmission from "../Component/Examination/Exam/UnlockMarkSubmission"
// import ExamFeesNew from "../Component/Examination/Exam/ExamFeesNew"
// import BatchTransferNew from "../Component/CMS/Dashboard/Admission/BatchTransferNew";//  new added 16
// //import NewCourses from "../Component/CMS/Dashboard/Masters/NewCourses";         //   new added currently
// import UpdateMobile from "../pages/SuperAdmin/Administration/UpdateMobile";
//  import ManageUsers from "../pages/SuperAdmin/Administration/ManageUsers";
// function SuperAdminRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
//     return (
//         <Routes>
//             {/* Main Dashboard - TODO: Create proper SuperAdmin dashboard component */}
//             <Route
//                 path="dashboard"
//                 element={
//                     <PaddedLayout>
//                         {userLoginId === "CMSAdmin" ||
//                             userLoginId === "MANTRALAYA" ||
//                             userLoginId === "DIRECTOR" ? (
//                             <UserDashboardPage
//                                 userLoginId={userLoginId}
//                                 isLoggedIn={isLoggedIn}
//                                 onLoginStateChange={onLoginStateChange}
//                             />
//                         ) : (
//                             <SuperAdminDashboard
//                                 userLoginId={userLoginId}
//                                 isLoggedIn={isLoggedIn}
//                                 onLoginStateChange={onLoginStateChange}
//                             />
//                         )}
//                     </PaddedLayout>
//                 }
//             />
            


//             {/* <Route path="ManageNotifications" element={<PaddedLayout><ManageNotifications /></PaddedLayout>} /> */}
//              <Route path="ManageNotifications" element={<PaddedLayout><ManageNotifications /></PaddedLayout>} />
//             <Route path="ExamFees" element={<PaddedLayout><ExamFeesNew /></PaddedLayout>} /> 
//             <Route path="ManageActivityStatus" element={<PaddedLayout><AdmissionDates /></PaddedLayout>} />
//             <Route path="ManageProjectConfiguration" element={<PaddedLayout><ManageProjectConfiguration /></PaddedLayout>} />
//             <Route path="ManageReports" element={<PaddedLayout><ManageReports /></PaddedLayout>} />
//             <Route path="MenuHome" element={<PaddedLayout><ManageMenu /></PaddedLayout>} />
//             <Route path="ManageUsers" element={<PaddedLayout><ManageUsers /></PaddedLayout>} />

//             <Route path="BatchTransfer" element={<PaddedLayout><BatchTransferNew /></PaddedLayout>} />


//             <Route path="ManageEvalutionSubscriptionStatus" element={<PaddedLayout><ManageEvalutionSubscriptionStatus /></PaddedLayout>} />
//              <Route path="CheckApplicationID" element={<PaddedLayout><UpdateMobile /></PaddedLayout>} />
             
           



//  {/* import ManageUsers from "../pages/SuperAdmin/Administration/ManageUsers"; */}
// function SuperAdminRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
//   return (
//     <Routes>
//       {/* Main Dashboard - TODO: Create proper SuperAdmin dashboard component */}
//       <Route
//         path="dashboard"
//         element={
//           <PaddedLayout>
//             {userLoginId === "CMSAdmin" ||
//             userLoginId === "MANTRALAYA" ||
//             userLoginId === "DIRECTOR" ? (
//               <UserDashboardPage
//                 userLoginId={userLoginId}
//                 isLoggedIn={isLoggedIn}
//                 onLoginStateChange={onLoginStateChange}
//               />
//             ) : (
//               <SuperAdminDashboard
//                 userLoginId={userLoginId}
//                 isLoggedIn={isLoggedIn}
//                 onLoginStateChange={onLoginStateChange}
//               />
//             )}
//           </PaddedLayout>
//         }
//       />

//       <Route
//         path="ManageNotifications"
//         element={
//           <PaddedLayout>
//             <ManageNotifications />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ManageActivityStatus"
//         element={
//           <PaddedLayout>
//             <ManageActivityStatus />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ManageProjectConfiguration"
//         element={
//           <PaddedLayout>
//             <ManageProjectConfiguration />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ManageReports"
//         element={
//           <PaddedLayout>
//             <ManageReports />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="MenuHome"
//         element={
//           <PaddedLayout>
//             <ManageMenu />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ManageUsers"
//         element={
//           <PaddedLayout>
//             <ManageUsers />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="BatchTransfer"
//         element={
//           <PaddedLayout>
//             <BatchTransfer />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ManageEvalutionSubscriptionStatus"
//         element={
//           <PaddedLayout>
//             <ManageEvalutionSubscriptionStatus />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ExamFees"
//         element={
//           <PaddedLayout>
//             <ExamFees />
//           </PaddedLayout>
//         }
//       />
//       {/* <Route
//         path="ManageActivityStatus"
//         element={
//           <PaddedLayout>
//             <ManageActivityStatus />
//           </PaddedLayout>
//         }
//       /> */}
//       <Route
//         path="EditUserProfile"
//         element={
//           <PaddedLayout>
//             <EditUserProfile />
//           </PaddedLayout>
//         }
//       />
//       <Route
//         path="ResetApplicationVariables"
//         element={
//           <PaddedLayout>
//             <ResetApplicationVariables />
//           </PaddedLayout>
//         }
//       />
//     </Routes>
//   );
// }

// export default SuperAdminRoutes;
// SuperAdminRoutes.jsx - Routes for SuperAdmin users
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import SuperAdminDashboard from "../Component/SuperAdmin/Dashboard/DashboardSuperAdmin";
import ManageNotifications from "../Component/SuperAdmin/Administration/ManageNotifications";
import ManageMenu from "../Component/SuperAdmin/Administration/MenuHome";
import UserDashboardPage from "../Component/CMS/Dashboard/Dashboard";
import ManageEvalutionSubscriptionStatus from "../Component/Examination/Exam/UnlockMarkSubmission";
import AdmissionDates from "../Component/Examination/Exam/AdmissionDates";
import ExamFeesNew from "../Component/Examination/Exam/ExamFeesNew";
import BatchTransferNew from "../Component/CMS/Dashboard/Admission/BatchTransferNew";
import EditUserProfile from "../Component/Login/Miscellaneous/ChangeSecurityQuestion";
import ManageReports from "../pages/SuperAdmin/Administration/ManageReports";
import ManageProjectConfiguration from "../pages/SuperAdmin/Administration/ManageProjectConfiguration";
import ResetApplicationVariables from "../pages/SuperAdmin/Administration/ResetApplicationVariables";
import UpdateMobile from "../pages/SuperAdmin/Administration/UpdateMobile";
import ManageUsers from "../pages/SuperAdmin/Administration/ManageUsers";
import ExamFeesDetails from "../Component/Examination/Exam/ExamFeesDetails";
import State from "../pages/Master/State"; 
import District from "../pages/Master/District"; 
import Taluka from "../pages/Master/Taluka";
import City from "../pages/Master/City";
import Region from "../pages/Master/Region";
import Pincode from "../pages/Master/Pincode";
import Caste from "../pages/Master/Caste";
import Category from "../pages/Master/Category";
import Disability from "../pages/Master/Disability";
import AcademicYear from "../pages/Master/AcademicYear";
import ActivityStatus from "../pages/Master/ActivityStatus";
import AffiliationPages from "../pages/Master/AffiliationPages";
import ApplicationFormLinks from "../pages/Master/ApplicationFormLinks";
import ApprovalGroup from "../pages/Master/ApprovalGroup";
import ApprovalOrder from "../pages/Master/ApprovalOrder";
import Batch from "../pages/Master/Batch";
import Country from "../pages/Master/Country";
import SubSector from "../pages/Master/SubSector";
import SubjectCourse from "../pages/Master/SubjectCourse";  
import Language from "../pages/Master/Language";
import Designation from "../pages/Master/Designation";
import CourseType from "../pages/Master/CourseType";
import Documents from "../pages/Master/Documents";
import FacilityGroup from "../pages/Master/FacilityGroup";
import BloodGroup from "../pages/Master/BloodGroup";
import Gender from "../pages/Master/Gender";
import BuildingFloor from "../pages/Master/BuildingFloor";
import BuildingNameType from "../pages/Master/BuildingNameType";
import BuildingOwnershipType from "../pages/Master/BuildingOwnershipType";
import BuildingStatus from "../pages/Master/BuildingStatus";
import BuildingUsageType from "../pages/Master/BuildingUsageType";
import Constituency from "../pages/Master/Constituency";
import ConstructionType from "../pages/Master/ConstructionType";
import ConstructionYear from "../pages/Master/ConstructionYear";
import ContactUsType from "../pages/Master/ContactUsType";
import CourseApprover from "../pages/Master/CourseApprover";
import Sector from "../pages/Master/Sector";
// import MasterElectiveSubject from "../pages/Master/MasterElectiveSubject";
import Title from "../pages/Master/Title";
import SignatureAuthority from "../pages/Master/SignatureAuthority";
import FloorPreference from "../pages/Master/FloorPreference";
import GrievanceCategory from "../pages/Master/GrievanceCategory";
import FAQCategory from "../pages/Master/FAQCategory";
import FacilitySubGroup from "../pages/Master/FacilitySubGroup";
import JobRole from "../pages/Master/JobRole";
import LocationCategory from "../pages/Master/LocationCategory";
import LandOwnershipType from "../pages/Master/LandOwnershipType";
import Month from "../pages/Master/Month";
import SecurityQuestion from "../pages/Master/SecurityQuestion";
import SkillTrade  from "../pages/Master/SkillTrade";
import Qualification from "../pages/Master/Qualification";
import RestrictedKeyword from "../pages/Master/RestrictedKeyword";
import Shift from "../pages/Master/Shift";
import VCApplication from "../pages/Master/VCApplication";
import TypeofInstitute from "../pages/Master/TypeofInstitute";
import TrainingRemarkforUtilization from "../pages/Master/TrainingRemarkforUtilization";
import TrainingFeeCategory from "../pages/Master/TrainingFeeCategory";
import TrainingEquipment from "../pages/Master/TrainingEquipment";
import TrainingCategory from "../pages/Master/TrainingCategory";
import TrainingNameofItem from "../pages/Master/TrainingNameofItem";
import EquipmentCategory from "../pages/Master/EquipmentCategory";
import SectorialExpertise from "../pages/Master/SectorialExpertise";
import Subject from "../pages/Master/Subject";
import PromoterStatus from "../pages/Master/PromoterStatus";
import PromoterType from "../pages/Master/PromoterType";
import PromotingType from "../pages/Master/PromotingType";
import NotificationCategory from "../pages/Master/NotificationCategory";
import OtherInfra from "../pages/Master/OtherInfra";
import OtherInfraOptions from "../pages/Master/OtherInfraOptions";
import UserType from "../pages/Master/UserType";
import ProjectConfiguration from "../pages/Master/ProjectConfiguration";
import ITISpecificationCategory from "../pages/Master/ITISpecificationCategory";
import ITISpecificationGroup from "../pages/Master/ITISpecificationGroup";
import ITISpecificationItem031025 from "../pages/Master/ITISpecificationItem031025";
import ITISpecificationNameofItemAsperDGT from "../pages/Master/ITISpecificationNameofItemAsperDGT";
import ITISpecificationNameofItemAsperDVET from "../pages/Master/ITISpecificationNameofItemAsperDVET";
import ITISpecificationSector from "../pages/Master/ITISpecificationSector";
import ITISpecificationTrade from "../pages/Master/ITISpecificationTrade";
import ITISpecificationUsage  from "../pages/Master/ITISpecificationUsage";
import ITISpecificationSpecificationAsperDGT from "../pages/Master/ITISpecificationSpecificationAsperDGT";
import ITISpecificationSectorWise from "../pages/Master/ITISpecificationSectorWise";
import IgnoreWords from "../pages/Master/IgnoreWords";
import FinancialYear from "../pages/Master/FinancialYear";
import User from "../pages/Master/User";
import BatchType from "../pages/Master/BatchType";
import BatchStatus from "../pages/Master/BatchStatus";
import ExamType from "../pages/Master/ExamType";
import Religion from "../pages/Master/Religion";
import SuccessStories from "../pages/Master/SuccessStories";
import ITISpecificationItem from "../pages/Master/ITISpecificationItem";
import InstituteCategory from "../pages/Master/InstituteCategory";
import InstituteOwnership from "../pages/Master/InstituteOwnership";
import InfraCategory from "../pages/Master/InfraCategory";
import InfraItems from "../pages/Master/InfraItems";
import TrainingEquipmentList from "../pages/Master/TrainingEquipmentList";
import OBWCCourse from "../pages/Master/OBWCCourse";
import OBWCInstitute from "../pages/Master/OBWCInstitute";
import MasterList from "../pages/Master/MasterList";
import Examination from "../pages/CMS/Exam/Examination";
import GreenRequirementsStatus from "../Component/DVETHO/Reports/GreenRequirementsStatus";
import UpdateFixedOrientationIssueImage from "../pages/SuperAdmin/Administration/UpdateFixedOrientationIssueImage";

function SuperAdminRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route
        path="dashboard"
        element={
          <PaddedLayout>
            {userLoginId === "CMSAdmin" ||
            userLoginId === "MANTRALAYA" ||
            userLoginId === "DIRECTOR" ? (
              <UserDashboardPage
                userLoginId={userLoginId}
                isLoggedIn={isLoggedIn}
                onLoginStateChange={onLoginStateChange}
              />
            ) : (
              <SuperAdminDashboard
                userLoginId={userLoginId}
                isLoggedIn={isLoggedIn}
                onLoginStateChange={onLoginStateChange}
              />
            )}
          </PaddedLayout>
        }
      />
      <Route path="MasterList" element={<PaddedLayout><MasterList /></PaddedLayout>} />
      <Route path="OBWCInstitute" element={<PaddedLayout><OBWCInstitute /></PaddedLayout>} />
      <Route path="OBWCCourse" element={<PaddedLayout><OBWCCourse /></PaddedLayout>} />
      <Route path="TrainingEquipmentList" element={<PaddedLayout><TrainingEquipmentList /></PaddedLayout>} />
      <Route path="InfraItems" element={<PaddedLayout><InfraItems /></PaddedLayout>} />
      <Route path="InfraCategory" element={<PaddedLayout><InfraCategory /></PaddedLayout>} />
      <Route path="InstituteOwnership" element={<PaddedLayout><InstituteOwnership /></PaddedLayout>} />
      <Route path="InstituteCategory" element={<PaddedLayout><InstituteCategory /></PaddedLayout>} />
      <Route path="ITISpecificationItem" element={<PaddedLayout><ITISpecificationItem /></PaddedLayout>} />
      <Route path="SuccessStories" element={<PaddedLayout><SuccessStories /></PaddedLayout>} />
      <Route path="Religion" element={<PaddedLayout><Religion /></PaddedLayout>} />
      <Route path="ExamType" element={<PaddedLayout><ExamType /></PaddedLayout>} />
      <Route path="BatchStatus" element={<PaddedLayout><  BatchStatus /></PaddedLayout>} />
      <Route path="BatchType" element={<PaddedLayout><BatchType /></PaddedLayout>} />
      <Route path="User" element={<PaddedLayout><User /></PaddedLayout>} />
      <Route path="FinancialYear" element={<PaddedLayout><FinancialYear /></PaddedLayout>} />
      <Route path="IgnoreWords" element={<PaddedLayout><IgnoreWords /></PaddedLayout>} />
      <Route path="ITISpecificationSectorWise" element={<PaddedLayout><ITISpecificationSectorWise /></PaddedLayout>} />
      <Route path="ITISpecificationSpecificationAsperDGT" element={<PaddedLayout><ITISpecificationSpecificationAsperDGT /></PaddedLayout>} />
      <Route path="ITISpecificationUsage" element={<PaddedLayout><ITISpecificationUsage /></PaddedLayout>} />
      <Route path="ITISpecificationTrade" element={<PaddedLayout><ITISpecificationTrade /></PaddedLayout>} />
      <Route path="ITISpecificationSector" element={<PaddedLayout><ITISpecificationSector /></PaddedLayout>} />
      <Route path="ITISpecificationNameofItemAsperDVET" element={<PaddedLayout><ITISpecificationNameofItemAsperDVET /></PaddedLayout>} />
      <Route path="ITISpecificationNameofItemAsperDGT" element={<PaddedLayout><ITISpecificationNameofItemAsperDGT /></PaddedLayout>} />
      <Route path="ITISpecificationItem031025" element={<PaddedLayout><ITISpecificationItem031025 /></PaddedLayout>} />
      <Route path="ITISpecificationGroup" element={<PaddedLayout><ITISpecificationGroup /></PaddedLayout>} />
      <Route path="ITISpecificationCategory" element={<PaddedLayout><ITISpecificationCategory /></PaddedLayout>} />
      <Route path="ProjectConfiguration" element={<PaddedLayout><ProjectConfiguration /></PaddedLayout>} />
    
      <Route path="UserType" element={<PaddedLayout><UserType /></PaddedLayout>} />
      <Route path="OtherInfraOptions" element={<PaddedLayout><OtherInfraOptions /></PaddedLayout>} />
      <Route path="OtherInfra" element={<PaddedLayout><OtherInfra   /></PaddedLayout>} />
      <Route path="NotificationCategory" element={<PaddedLayout><NotificationCategory /></PaddedLayout>} />
      <Route path="PromotingType" element={<PaddedLayout><  PromotingType /></PaddedLayout>} />
      <Route path="PromoterType" element={<PaddedLayout><PromoterType /></PaddedLayout>} />
      <Route path="PromoterStatus" element={<PaddedLayout><PromoterStatus /></PaddedLayout>} />
      < Route path="Subject" element={<PaddedLayout><Subject /></PaddedLayout>} />
      <Route path="SectorialExpertise" element={<PaddedLayout><SectorialExpertise /></PaddedLayout>} />
      <Route path="EquipmentCategory" element={<PaddedLayout><EquipmentCategory /></PaddedLayout>} />
      <Route path="TrainingNameofItem" element={<PaddedLayout><TrainingNameofItem /></PaddedLayout>} />
      <Route path="TrainingCategory" element={<PaddedLayout><TrainingCategory /></PaddedLayout>} />
      <Route path="TrainingEquipment" element={<PaddedLayout><  TrainingEquipment /></PaddedLayout>} />
      <Route path="TrainingFeeCategory" element={<PaddedLayout><TrainingFeeCategory /></PaddedLayout>} />
      <Route path="TrainingRemarkforUtilization" element={<PaddedLayout><TrainingRemarkforUtilization /></PaddedLayout>} />
      <Route path="TypeofInstitute" element={<PaddedLayout><TypeofInstitute /></PaddedLayout>} />
      <Route path="VCApplication" element={<PaddedLayout><VCApplication /></PaddedLayout>} /> 
      <Route path="Shift" element={<PaddedLayout><Shift /></PaddedLayout>} /> 
      <Route path="RestrictedKeyword" element={<PaddedLayout><RestrictedKeyword /></PaddedLayout>} />
      <Route path="Qualification" element={<PaddedLayout><Qualification /></PaddedLayout>} />
      <Route path="SkillTrade" element={<PaddedLayout><SkillTrade /></PaddedLayout>} />
      <Route path="SecurityQuestion" element={<PaddedLayout><SecurityQuestion /></PaddedLayout>} />
      <Route path="Month" element={<PaddedLayout><Month /></PaddedLayout>} />
      <Route path="LandOwnershipType" element={<PaddedLayout><LandOwnershipType /></PaddedLayout>} />
       <Route path="LocationCategory" element={<PaddedLayout><LocationCategory /></PaddedLayout>} />
            <Route path="JobRole" element={<PaddedLayout><JobRole /></PaddedLayout>} />
            <Route path="FacilitySubGroup" element={<PaddedLayout><FacilitySubGroup /></PaddedLayout>} />
            <Route path="FAQCategory" element={<PaddedLayout><FAQCategory /></PaddedLayout>} />
            <Route path="GrievanceCategory" element={<PaddedLayout><GrievanceCategory /></PaddedLayout>} />
            <Route path="FloorPreference" element={<PaddedLayout><FloorPreference /></PaddedLayout>} />
            <Route path="SignatureAuthority" element={<PaddedLayout><SignatureAuthority /></PaddedLayout>} />
            <Route path="Title" element={<PaddedLayout><Title /></PaddedLayout>} />
            {/* <Route path="MasterElectiveSubject" element={<PaddedLayout><MasterElectiveSubject /></PaddedLayout>} />  */}
            <Route path="Sector" element={<PaddedLayout><Sector /></PaddedLayout>} />
            <Route path="CourseApprover" element={<PaddedLayout><CourseApprover /></PaddedLayout>} /> 
            <Route path="ContactUsType" element={<PaddedLayout><ContactUsType /></PaddedLayout>} /> 
            <Route path="ConstructionYear" element={<PaddedLayout><ConstructionYear /></PaddedLayout>} /> 
            <Route path="ConstructionType" element={<PaddedLayout><ConstructionType/></PaddedLayout>}/>
            <Route path="Constituency" element={<PaddedLayout><Constituency /></PaddedLayout>} />   
            <Route path="BuildingUsageType" element={<PaddedLayout><BuildingUsageType /></PaddedLayout>} />
            <Route path="BuildingStatus" element={<PaddedLayout><BuildingStatus /></PaddedLayout>} />
            <Route path="BuildingOwnershipType" element={<PaddedLayout><BuildingOwnershipType /></PaddedLayout>} />
            <Route path="BuildingNameType" element={<PaddedLayout><BuildingNameType /></PaddedLayout>} />
            <Route path="BuildingFloor" element={<PaddedLayout><BuildingFloor /></PaddedLayout>} />
            <Route path="Gender" element={<PaddedLayout><Gender /></PaddedLayout>} />
            <Route path="BloodGroup" element={<PaddedLayout><BloodGroup /></PaddedLayout>} />
            <Route path="FacilityGroup" element={<PaddedLayout><FacilityGroup /></PaddedLayout>} />
            <Route path="Documents" element={<PaddedLayout><Documents /></PaddedLayout>} />
            <Route path="CourseType" element={<PaddedLayout><CourseType /></PaddedLayout>} />
            <Route path="Designation" element={<PaddedLayout><Designation /></PaddedLayout>} />
            <Route path="Language" element={<PaddedLayout><Language /></PaddedLayout>} /> 
            <Route path="SubjectCourse" element={<PaddedLayout><SubjectCourse /></PaddedLayout>} />
           <Route path="SubSector" element={<PaddedLayout><SubSector /></PaddedLayout>} />
            <Route path="Country" element={<PaddedLayout><Country /></PaddedLayout>} />
            <Route path="Batch" element={<PaddedLayout><Batch /></PaddedLayout>} />
            <Route path="ApprovalGroup" element={<PaddedLayout><ApprovalGroup /></PaddedLayout>} />
            <Route path="ApprovalOrder" element={<PaddedLayout><ApprovalOrder /></PaddedLayout>} /> 
            <Route path="ApplicationFormLinks" element={<PaddedLayout><ApplicationFormLinks /></PaddedLayout>} />
            <Route path="AffiliationPages" element={<PaddedLayout><AffiliationPages /></PaddedLayout>} />
            <Route path="ActivityStatus" element={<PaddedLayout><ActivityStatus /></PaddedLayout>} />
            <Route path="AcademicYear" element={<PaddedLayout><AcademicYear /></PaddedLayout>} />
            <Route path="Disability" element={<PaddedLayout><Disability /></PaddedLayout>} />
            <Route path="Category" element={<PaddedLayout><Category /></PaddedLayout>} />
            <Route path="Caste" element={<PaddedLayout><Caste /></PaddedLayout>} />
            <Route path="Pincode" element={<PaddedLayout><Pincode /></PaddedLayout>} />
            <Route path="City" element={<PaddedLayout><City /></PaddedLayout>} />
            <Route path="Taluka" element={<PaddedLayout><Taluka /></PaddedLayout>} />
            <Route path="Region" element={<PaddedLayout><Region /></PaddedLayout>} />
            <Route path="District" element={<PaddedLayout><District /></PaddedLayout>} />
            <Route path="state" element={<PaddedLayout><State /></PaddedLayout>} />

      <Route path="ManageNotifications" element={<PaddedLayout><ManageNotifications /></PaddedLayout>} />
      <Route path="ExamFees" element={<PaddedLayout><ExamFeesNew /></PaddedLayout>} />
      <Route path="Exam/details" element={<PaddedLayout><ExamFeesDetails /></PaddedLayout>} />
      <Route path="ManageActivityStatus" element={<PaddedLayout><AdmissionDates /></PaddedLayout>} />
      <Route path="ManageProjectConfiguration" element={<PaddedLayout><ManageProjectConfiguration /></PaddedLayout>} />
      <Route path="ManageReports" element={<PaddedLayout><ManageReports /></PaddedLayout>} />
      <Route path="MenuHome" element={<PaddedLayout><ManageMenu /></PaddedLayout>} />
      <Route path="ManageUsers" element={<PaddedLayout><ManageUsers /></PaddedLayout>} />
      <Route path="BatchTransfer" element={<PaddedLayout><BatchTransferNew /></PaddedLayout>} />
      <Route path="ManageEvalutionSubscriptionStatus" element={<PaddedLayout><ManageEvalutionSubscriptionStatus /></PaddedLayout>} />
      <Route path="CheckApplicationID" element={<PaddedLayout><UpdateMobile /></PaddedLayout>} />
      <Route path="EditUserProfile" element={<PaddedLayout><EditUserProfile /></PaddedLayout>} />
      <Route path="ResetApplicationVariables" element={<PaddedLayout><ResetApplicationVariables /></PaddedLayout>} />
        <Route path="Examination" element={<PaddedLayout><Examination /></PaddedLayout>} />
          <Route
              path="GreenRequirementUnlock"
              element={
                  <PaddedLayout>
                      <GreenRequirementsStatus />
                  </PaddedLayout>
              }
          />
        <Route path="UpdateCandidateProfileSignImage" element={<PaddedLayout><UpdateFixedOrientationIssueImage/></PaddedLayout>}/>
      
    </Routes>
  );
}

export default SuperAdminRoutes;