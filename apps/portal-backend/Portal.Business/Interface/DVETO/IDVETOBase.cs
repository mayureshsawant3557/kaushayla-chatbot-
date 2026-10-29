using Portal.Entities.DVETO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.DVETO
{
    public interface IDVETOBase
    {
        DVETOBaseEntity GetOfficeDetails(long officeId, string userLoginId);

        string SaveOfficeDetails(DVETOBaseEntity entity);
    

        List<DVETOManagementDetailsEntity> GetDVETOManagementDetails(long dvetoID);
        string SaveDVETOManagementDetails(DVETOManagementDetailsEntity entity);

        // DVETO INSPECTION COMMITTEE

        DVETOInspectionCommitteeResponse GetDVETOInspectionCommitteeDetails(long InstituteID);
        bool SaveDVETOInspectionCommittee(DVETOInspectionCommitteeEntity entity);

        DataTable deleteDVETOInspectionCommittee(long ID);

        string saveDVETOInspectionCommitteephot(int InstituteID , string PhotoPath, string User , string IP);


        // DVETO USER DETAILS 
        DataTable DVETO_GetDveto_ManagementTypeByDvetoID(long DVETOID, int managementType);

        // dpdc fund allocation 
        DataTable DVETO_GetInstituteForDpdcFund(int OfficeID, string InstType, string InstituteCode);
        DataSet DVETO_GetCompleteFundAllocationData(int FinancialYearID, int DistrictID, int MajorHeadID);

        DataTable DVETO_SaveCompleteFundAllocationData(DVETOFundAllocationEntity entity);

        // updated dveto fund allocation 2203
        DataSet DVETO_GetFundAllocationData_2203(int FinancialYearID, int DistrictID, string InstituteCode);
        DataTable DVETO_SaveFundAllocationData_2203(SaveFundAllocationRequest entity);

        DataSet DVETO_GetFundAllocationMasters_2203();

        //2230
        DataSet DVETO_GetFundAllocationMasters_2230();

        DataSet DVETO_GetFundAllocationData_2230(int FinancialYearID, int DistrictID, string InstituteCode);

        DataTable DVETO_SaveFundAllocationData_2230(SaveFundAllocationRequest entity);

        DataSet GetHeadDocuments_2203(int OfficeID, int FinancialYearID);
        DataTable Save_HeadDocuments_2203(SaveHeadDocumentEntity entity);

        DataSet GetHeadDocuments_2230(int OfficeID, int FinancialYearID);
        DataTable Save_HeadDocuments_2230(SaveHeadDocumentEntity entity);
        DataSet StateFund_GetOfficeUsers();

        DataSet GetAdminDashboard(Int32 UserTypeID, string UserLoginID);







    }
}

