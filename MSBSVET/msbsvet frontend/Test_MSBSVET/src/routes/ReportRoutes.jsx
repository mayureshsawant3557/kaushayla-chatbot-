
x


import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import AdmissionCancellation from "../Component/SuperAdmin/Reports/AdmissionCancellation";
import RejectedCandidateList from "../Component/SuperAdmin/Reports/RejectedCandidateList";
import STTBatchResultReport from "../Component/SuperAdmin/Reports/STTBatchResultReport";





function ExamRoutes() {
   return (
       <Routes>
           <Route path="AdmissionCancellation" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />
           <Route path="RejectedCandidateList" element={<PaddedLayout><RejectedCandidateList /></PaddedLayout>} />
           <Route path="STTBatchResultReport" element={<PaddedLayout><STTBatchResultReport /></PaddedLayout>} />
           {/*<Route path="ReadyforAssessment" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />*/}
           {/*<Route path="ReadyforAssessment" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />*/}
           {/*<Route path="ReadyforAssessment" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />*/}
           {/*<Route path="ReadyforAssessment" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />*/}
           {/*<Route path="ReadyforAssessment" element={<PaddedLayout><AdmissionCancellation/></PaddedLayout>} />*/}
           


       </Routes>
   );
}

export default ExamRoutes;
