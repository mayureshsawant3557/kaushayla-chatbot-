import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import SearchInstitute from "../Component/Institute/SearchInstitute";
import Course from "../Component/course/Coureses";
import ContactUs from "../Component/Home/ContactUs";
import HomePage from "../pages/HomePage";
import CertificateVerificationSystem from "../Component/Examination/Certificate_Verification/CertificateVerification";
import SuccessStoriesPublish from "../Component/Home/SuccessStoriesPublish";
import AboutBoard from "../Component/About/AboutBoard";
import Vision from "../Component/About/Vision";
import Mission from "../Component/About/Mission";
import Values from "../Component/About/Values";
import Objectives from "../Component/About/Objectives";
import Goals from "../Component/About/Goals";
import GoverningBoard from "../Component/About/GoveringBoard";
import GoverningCouncil from "../Component/About/GoverningCouncil";
import OfficeBearers from "../Component/About/OfficeBearers";
import OrganizationStructure from "../Component/About/OrganizationStructure";   

import UnauthorizedInstitutes from "../Component/Institute/UnauthorizedInstitutes";
import ComplaintForm from "../Component/Institute/RegisterComplaint";
import ComplaintStatus from "../Component/Institute/ComplaintStatus";
import ITIShortTermTraining from "../Component/ITIShortTermTraining/ITIShortTermTraining";
import LegitDoc from "../Component/Home/legitdoc";
import LegitDoc22 from "../Component/Home/LegitDoc22";
import LegitDownload from "../Component/Home/LegitDownload";
import LegitDownload22 from "../Component/Home/LegitDownload22";
import RTI from "../Component/Home/RTI";
import CitizenCharter from "../Component/Home/CitizenCharter";
import ExamCircular from "../Component/Home/ExamCircular";
import ExamPattern from "../Component/Home/ExamPattern";
import ExamTimeTable from "../Component/Home/ExamTimeTable";
import PromotingOrganizationRegistration from "../pages/Registrations/PromotingOrganizationRegistration";
import Sitemap from "../Component/Home/Sitemap";
import Disclaimer from "../Component/Home/Disclaimer";


function PublicRoutes({ isLoggedIn, onLoginStateChange }) {
    return (
        <Routes>
            {/* Home Route - accessible at /Public/Home */}
            <Route
                path="Home"
                element={
                    <HomePage
                        isLoggedIn={isLoggedIn}
                        onLoginStateChange={onLoginStateChange}
                    />
                }
            />

            {/* Existing routes */}
            <Route path="institutes" element={<PaddedLayout><SearchInstitute /></PaddedLayout>} />
            <Route path="courses" element={<PaddedLayout><Course /></PaddedLayout>} />
            <Route path="coursesSTT" element={<PaddedLayout><Course /></PaddedLayout>} />

            <Route path="LegitDoc" element={<PaddedLayout><LegitDoc /></PaddedLayout>} />
            <Route path="LegitDoc22" element={<PaddedLayout><LegitDoc22 /></PaddedLayout>} />
            <Route path="LegitDownload" element={<PaddedLayout><LegitDownload /></PaddedLayout>} />
            <Route path="LegitDownload22" element={<PaddedLayout><LegitDownload22 /></PaddedLayout>} />
            <Route path="RTI" element={<PaddedLayout><RTI /></PaddedLayout>} />
            <Route path="CitizenCharter" element={<PaddedLayout><CitizenCharter /></PaddedLayout>} />
            <Route path="ExamCircular" element={<PaddedLayout><ExamCircular /></PaddedLayout>} />
            <Route path="ExamPattern" element={<PaddedLayout><ExamPattern /></PaddedLayout>} />
            <Route path="ExamTimeTable" element={<PaddedLayout><ExamTimeTable /></PaddedLayout>} />



            <Route path="UnauthorizedInstitutes" element={<PaddedLayout><UnauthorizedInstitutes /></PaddedLayout>} />
            <Route path="register-complaint" element={<PaddedLayout><ComplaintForm /></PaddedLayout>} />
            <Route path="complaint-status" element={<PaddedLayout><ComplaintStatus /></PaddedLayout>} />            
            <Route path="ContactUs" element={<PaddedLayout><ContactUs /></PaddedLayout>} />
            <Route path="CertificateVerification" element={<CertificateVerificationSystem />} />
            <Route path="success-stories-publish" element={<PaddedLayout><SuccessStoriesPublish /></PaddedLayout>} />
            <Route path="ITIShortTermTraining" element={<PaddedLayout><ITIShortTermTraining /></PaddedLayout>} />
            {/*// About Routes*/}
            <Route path="AboutBoard" element={<PaddedLayout><AboutBoard /></PaddedLayout>} />
            <Route path="Vision" element={<PaddedLayout><Vision /></PaddedLayout>} />
            <Route path="mission" element={<PaddedLayout><Mission /></PaddedLayout>} />
            <Route path="CoreValues" element={<PaddedLayout><Values /></PaddedLayout>} />
            <Route path="objectives" element={<PaddedLayout><Objectives /></PaddedLayout>} />
            <Route path="goals" element={<PaddedLayout><Goals /></PaddedLayout>} />
            <Route path="GoverningBoard" element={<PaddedLayout><GoverningBoard /></PaddedLayout>} />
            <Route path="GoverningCouncil" element={<PaddedLayout><GoverningCouncil /></PaddedLayout>} />
            <Route path="OfficeBearers" element={<PaddedLayout><OfficeBearers /></PaddedLayout>} />
            <Route path="OrganizationStructure" element={<PaddedLayout><OrganizationStructure /></PaddedLayout>} />
            <Route path="Sitemap" element={<PaddedLayout><Sitemap /></PaddedLayout>} />
            <Route path="Disclaimer" element={<PaddedLayout><Disclaimer /></PaddedLayout>} />
          
            <Route path="PromotingOrganizationRegistration" element={<PaddedLayout><PromotingOrganizationRegistration /></PaddedLayout>} />

        </Routes>
    );
}

export default PublicRoutes;