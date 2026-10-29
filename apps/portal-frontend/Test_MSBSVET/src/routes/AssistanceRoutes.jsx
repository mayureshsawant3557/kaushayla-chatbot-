import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import FAQComponent from "../Component/Assitance/FAQDataComponent";
import Metting from "../Component/Assitance/MettingComponent";
import VisitScheduler from "../Component/Assitance/VisitSchedulerComponent";
import GrievanceForm from "../Component/Assitance/GrievanceComponent";

function AssistanceRoutes() {
    return (
        <Routes>
            <Route path="/" element={
                <PaddedLayout>
                    <div className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <Metting />
                            </div>
                            <div className="md:col-span-1">
                                <VisitScheduler />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="">
                            <GrievanceForm />
                        </div>
                        <div className="">
                            <FAQComponent />
                        </div>
                    </div>
                </PaddedLayout>
            } />
            <Route path="faq" element={<PaddedLayout><FAQComponent /></PaddedLayout>} />
            <Route path="meeting" element={<PaddedLayout><Metting /></PaddedLayout>} />
            <Route path="visit-scheduler" element={<PaddedLayout><VisitScheduler /></PaddedLayout>} />
            <Route path="grievance" element={<PaddedLayout><GrievanceForm /></PaddedLayout>} />
        </Routes>
    );
}

export default AssistanceRoutes;