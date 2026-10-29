import DashboardWrapper from '../../Component/Dashboard/DashboardWrapper';
import PromotorOrgInstituteDashboard from '../Institute/Dashboard/PromotorOrgInstituteDash';

const PromotingOrganizationDashboard = () => {
    return (
        <DashboardWrapper
            DashboardComponent={PromotorOrgInstituteDashboard}
        />
    );
};

export default PromotingOrganizationDashboard;