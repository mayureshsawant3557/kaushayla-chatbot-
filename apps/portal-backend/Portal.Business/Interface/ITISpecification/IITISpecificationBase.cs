using Portal.Entities.Base;
using Portal.Entities.ITISpecification;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.ITISpecification
{
    public interface IITISpecificationBase
    {

        List<DropdownEntity> GetMasterGroup();
        List<DropdownEntity> GetMasterSector();
        List<DropdownEntity> GetMasterTrade();
        List<DropdownEntity> GetMasterCategory();
        List<DropdownEntity> GetMasterItem();
        List<TradeWiseItemEntity> GetTradeWiseItems(long tradeId);
        List<GroupWiseItemEntity> GetGroupWiseItems(int sectorId, int groupId, int categoryId, int itemId);
        List<SectorWiseItemEntity> GetSectorWiseItems(int sectorId, int categoryId, int itemId);
        List<SectorWiseItemEntity> GetAllItems();

        ApiResponse<object> SaveRequirements(SaveRequirementRequest request);
        ApiResponse<object> SubmitRequirements(SaveRequirementRequest request);
        ApiResponse<object> DeleteRequirements(DeleteRequirementRequest request);
        List<RequirementEntity> GetUserRequirements(long userId, string financialYear);
        List<ProposedTotalsEntity> GetProposedTotals(long userId, string financialYear);

        List<SectorEntity> GetSectorsWithTrades();
        ApiResponse<object> SaveSingleRequirement(SingleRequirementRequest request);


        // requirement status
        DataTable UpdateRequirementStatus(long userId, string financialYear, string newStatus, long modifiedBy, string remarks, long? approvedBy);
        DataTable GetUsersByStatus(string status, string financialYear);
        DataTable GetStatusSummary(string financialYear);
        bool IsRequirementSubmitted(long userId, string financialYear);
        // ppp funding 
        #region Interest Operations
        DataTable GetInterestData(string InstituteID);
        string SaveInterestData(InterestEntity entity);
        #endregion

        #region Revenue Operations
        DataTable GetRevenueData(string InstituteID);
        string SaveRevenueData(RevenueEntity entity);
        #endregion

        #region Expenditure Operations
        DataTable GetExpenditureData(string InstituteID);
        string SaveExpenditureData(ExpenditureEntity entity);
        #endregion

        #region Repayment Operations
        DataTable GetRepaymentData(string InstituteID);
        string SaveRepaymentData(RepaymentEntity entity);
        #endregion

        #region Fund Operations
        DataTable GetFundData(string InstituteID);
        #endregion

        #region PPP Fund Status Operations
        DataTable GetPPPFundStatus(string InstituteID);
        #endregion

        #region Financial Period Operations
        DataTable GetFinancialPeriods(string InstituteID);
        // DataTable GetFinancialPeriodById(int FinancialPeriodID, string InstituteID);
        #endregion



        //Updated ppp module work  

        DataTable GetFinancialDataForPppFund(int InstituteID);

        String SaveFinancialDataForPppFund(FinancialDataForPppFundEntity entity);


        DataTable GetInstituteAndManagementMobile(long instituteId, int managementType);


        // unlock the requirement deatils 

        string UpdateITIRequirementsStatusToDraft(int collegeID);

        // TO RETUEN AVAILABLE FUND FOR REQUIREMNET

        DataTable GetAvailableFundForRequirements(int FinancialYearID, int RegionID, int DistrictID, int TalukaID, int CollegeID);



    }

}
