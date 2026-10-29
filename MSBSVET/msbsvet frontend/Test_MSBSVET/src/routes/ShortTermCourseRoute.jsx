import { Routes, Route } from "react-router-dom";
import CourseTrainingFee from "../Component/CMS/Dashboard/Admission/TrainingFees";
import PaddedLayout from "../Component/Context/ReactComponent";

function ShortTermCourseRoute() {
    return (
        <Routes>
           
            <Route path='CourseTrainingFee'  element={<PaddedLayout><CourseTrainingFee /></PaddedLayout>} />
        </Routes>
    );
}

export default ShortTermCourseRoute;