import { Routes, Route } from "react-router-dom";
import SearchCourse from "../Component/CMS/Dashboard/Masters/SearchCoursesNew";
import PaddedLayout from "../Component/Context/ReactComponent";
import NewCourses from  "../Component/CMS/Dashboard/Masters/NewCourses"
 import CourseNormsPrint from "../Component/cms/Dashboard/Masters/PrintCourseNorms"

function MasterMgmtRoutes() {
    return (
        <Routes>
             <Route path='SearchCourse'  element={<PaddedLayout><SearchCourse /></PaddedLayout>} />
                <Route path='NewCourse'  element={<PaddedLayout><NewCourses /></PaddedLayout>} />
                 <Route path='PrintCourseNorms'  element={<PaddedLayout><CourseNormsPrint /></PaddedLayout>} />
        </Routes>
         
             
       
        
        
    );
}

export default MasterMgmtRoutes;