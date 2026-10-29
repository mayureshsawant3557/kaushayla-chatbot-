using Portal.Data.Source;
using Portal.Entities.ITISpecification;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {

        public DataTable GetMasterGroup()
        {
            return _dbAccess.GetDataTable("usp_ITISpecification_GetMasterGroup");
        }

        public DataTable GetMasterSectorForTrade()
        {
            return _dbAccess.GetDataTable("usp_ITISpecification_GetMasterSector");
        }

        public DataTable GetMasterTrade()
        {
            return _dbAccess.GetDataTable("usp_ITISpecification_GetMasterTrade");
        }

        public DataTable GetMasterCategory()
        {
            return _dbAccess.GetDataTable("usp_ITISpecification_GetMasterCategory");
        }

        public DataTable GetMasterItem()
        {
            return _dbAccess.GetDataTable("usp_ITISpecification_GetMasterItem");
        }
        public DataTable GetTradeWiseItems(long tradeId)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
        {
        { "@TradeID", tradeId }
        };
            return _dbAccess.GetDataTable("usp_ITISpecification_GetTradeWise", parms);
        }

        public DataTable GetGroupWiseItems(int sectorId, int groupId, int categoryId, int itemId)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
    {
        { "@SectorID", sectorId },
        { "@GroupID", groupId },
        { "@CategoryID", categoryId },
        { "@ItemID", itemId }
    };
            return _dbAccess.GetDataTable("usp_ITISpecification_GetGroupWise", parms);
        }



        public DataTable GetSectorWiseItems(int sectorId, int categoryId, int itemId)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
    {
        { "@SectorID", sectorId },
        { "@CategoryID", categoryId },
        { "@ItemID", itemId }
    };
            return _dbAccess.GetDataTable("usp_ITISpecification_GetSectorWise", parms);
        }


        public DataTable GetAllItems()
        {
            Dictionary<string, object> parms = new Dictionary<string, object>();

            return _dbAccess.GetDataTable("usp_ITISpecification_GetAllItems", parms);
        }

        public DataTable SaveRequirements(long userId, long? collegeId, string requirementsJson, string financialYear, string ipAddress, string operation)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
    {
        { "@UserID", userId },
        { "@CollegeID", collegeId },
        { "@Requirements", requirementsJson },
        { "@FinancialYear", financialYear },
        { "@IPAddress", ipAddress },
        { "@Operation", operation }
    };
            return _dbAccess.GetDataTable("usp_ITISpecification_SaveRequirements", parms);
        }

        public DataTable GetUserRequirements(long userId, string financialYear)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
            {
                { "@UserID", userId },
                { "@FinancialYear", financialYear }
            };
            return _dbAccess.GetDataTable("usp_ITISpecification_GetUserRequirements", parms);
        }

        public DataTable DeleteRequirements(string requirementIds, long userId, string ipAddress, string reason)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
        {
            { "@RequirementIDs", requirementIds },
            { "@UserID", userId },
            { "@IPAddress", ipAddress },
            { "@Reason", reason }
        };
            return _dbAccess.GetDataTable("usp_ITISpecification_DeleteRequirements", parms);
        }


        public DataTable SaveSingleRequirement(long userId, string collegeId, int itemId, int sectorId, int categoryId, decimal districtFund, decimal ppp, decimal stateFund, decimal requiredAsPerNorms,     
    decimal available, string financialYear, string ipAddress, string operation)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
        {
            { "@UserID", userId },
            { "@CollegeID", collegeId },
            { "@ItemID", itemId },
            { "@SectorID", sectorId },
            { "@CategoryID", categoryId },
            { "@DistrictFund", districtFund },
            { "@PPP", ppp },
            { "@StateFund", stateFund },
            { "@RequiredAsPerNorms", requiredAsPerNorms },  
            { "@Available", available },
            { "@FinancialYear", financialYear },
            { "@IPAddress", ipAddress },
            { "@Operation", operation }
        };
            return _dbAccess.GetDataTable("usp_ITISpecification_SaveSingleRequirement", parms);
        }

        public DataTable GetProposedTotals(long userId, string financialYear)
        {
            Dictionary<string, object> parms = new Dictionary<string, object>
    {
        { "@UserID", userId },
        { "@FinancialYear", financialYear }
    };
            return _dbAccess.GetDataTable("usp_ITISpecification_GetProposedTotals", parms);
        }



        public DataTable GetSectorsWithTrades()
        {
           
            return _dbAccess.GetDataTable("usp_ITISpecification_GetSectorsWithTrades");
        }

        public DataTable GetInterestData(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetInterestData", param);
        }

        public string SaveInterestData(InterestEntity entity)
        {
            var param = new Dictionary<string, object>();
           // param.Add("@InterestID", entity.InterestID == 0 ? (object)DBNull.Value : entity.InterestID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@FinancialPeriodID", entity.FinancialPeriodID);
            param.Add("@Interest", entity.Interest);
            param.Add("@ModifiedBy", entity.UserLoginID.ToString());
            param.Add("@ModifiedByIPAddress", entity.IPAddress);

            var result = _dbAccess.GetDataTable("usp_ITISpecification_SaveInterestData", param);

            if (result != null && result.Rows.Count > 0)
            {
                return result.Rows[0]["Status"].ToString();
            }

            return "Error";
        }

        public DataTable GetRevenueData(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetRevenueData", param);
        }

        public string SaveRevenueData(RevenueEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@RevenueID", entity.RevenueID == 0 ? (object)DBNull.Value : entity.RevenueID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@FinancialPeriodID", entity.FinancialPeriodID);
            param.Add("@RevenueAmount", entity.RevenueAmount);
            param.Add("@RevenueSource", string.IsNullOrEmpty(entity.RevenueSource) ? (object)DBNull.Value : entity.RevenueSource);
            param.Add("@RevenueType", string.IsNullOrEmpty(entity.RevenueType) ? (object)DBNull.Value : entity.RevenueType);
            param.Add("@ModifiedBy", entity.UserLoginID.ToString());
            param.Add("@ModifiedByIPAddress", entity.IPAddress);

            var result = _dbAccess.GetDataTable("usp_ITISpecification_SaveRevenueData", param);

            if (result != null && result.Rows.Count > 0)
            {
                return result.Rows[0]["Status"].ToString();
            }

            return "Error";
        }


        public DataTable GetExpenditureData(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetExpenditureData", param);
        }

        public string SaveExpenditureData(ExpenditureEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExpenditureID", entity.ExpenditureID == 0 ? (object)DBNull.Value : entity.ExpenditureID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@FinancialPeriodID", entity.FinancialPeriodID);
            param.Add("@CivilWorks", entity.CivilWorks);
            param.Add("@Equipment", entity.Equipment);
            param.Add("@Furniture", entity.Furniture);
            param.Add("@LearningResources", entity.LearningResources);
            param.Add("@AdditionalManpower", entity.AdditionalManpower);
            param.Add("@Consumable", entity.Consumable);
            param.Add("@Miscellaneous", entity.Miscellaneous);
            param.Add("@ModifiedBy", entity.UserLoginID.ToString());
            param.Add("@ModifiedByIPAddress", entity.IPAddress);

            var result = _dbAccess.GetDataTable("usp_ITISpecification_SaveExpenditureData", param);

            if (result != null && result.Rows.Count > 0)
            {
                return result.Rows[0]["Status"].ToString();
            }

            return "Error";
        }


        public DataTable GetRepaymentData(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetRepaymentData", param);
        }

        public string SaveRepaymentData(RepaymentEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@RepaymentID", entity.RepaymentID == 0 ? (object)DBNull.Value : entity.RepaymentID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@FinancialYearDisplay", entity.FinancialYearDisplay);
            // RepaymentSchedule parameter REMOVED
            param.Add("@RepaymentAmountAsPerSchedule", entity.RepaymentAmountAsPerSchedule);
            param.Add("@ActualRepaymentAmount", entity.ActualRepaymentAmount.HasValue ? entity.ActualRepaymentAmount.Value : (object)DBNull.Value);
            param.Add("@DateOfRepayment", entity.DateOfRepayment.HasValue ? entity.DateOfRepayment.Value : (object)DBNull.Value);
            param.Add("@PaymentMode", string.IsNullOrEmpty(entity.PaymentMode) ? (object)DBNull.Value : entity.PaymentMode);
            param.Add("@TransactionReference", string.IsNullOrEmpty(entity.TransactionReference) ? (object)DBNull.Value : entity.TransactionReference);
            param.Add("@ModifiedBy", entity.UserLoginID.ToString());
            param.Add("@ModifiedByIPAddress", entity.IPAddress);

            var result = _dbAccess.GetDataTable("usp_ITISpecification_SaveRepaymentData", param);

            if (result != null && result.Rows.Count > 0)
            {
                return result.Rows[0]["Status"].ToString();
            }

            return "Error";
        }

        public DataTable GetPPPFundStatus(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetPPPFundStatus", param);
        }

        public DataTable GetFundData(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetFundData", param);
        }


       


        public DataTable GetFinancialPeriods(string InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("usp_ITISpecification_GetFinancialPeriods", param);
        }

        //public DataTable GetFinancialPeriodById(int FinancialPeriodID)
        //{
        //    var param = new Dictionary<string, object>();
        //    param.Add("@FinancialPeriodID", FinancialPeriodID);
        //    return _dbAccess.GetDataTable("usp_GetFinancialPeriodById", param);
        //}




        //
        public DataTable UpdateITIRequirementStatus(long userId, string financialYear, string newStatus, long modifiedBy, string remarks, long? approvedBy)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", userId);
            param.Add("@FinancialYear", financialYear);
            param.Add("@NewStatus", newStatus);
            param.Add("@ModifiedBy", modifiedBy);
            param.Add("@Remarks", remarks ?? (object)DBNull.Value);
            param.Add("@ApprovedBy", approvedBy ?? (object)DBNull.Value);

            return _dbAccess.GetDataTable("usp_ITISpecification_UpdateRequirementStatus", param);
        }

        public DataTable GetITIUsersByStatus(string status, string financialYear)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Status", status ?? (object)DBNull.Value);
            param.Add("@FinancialYear", financialYear ?? (object)DBNull.Value);

            return _dbAccess.GetDataTable("usp_ITISpecification_GetUsersByStatus", param);
        }

        public DataTable GetITIStatusSummary(string financialYear)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYear", financialYear ?? (object)DBNull.Value);

            return _dbAccess.GetDataTable("usp_ITISpecification_GetStatusSummary", param);
        }

        
        public DataTable CheckITIRequirementSubmitted(long userId, string financialYear)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", userId);
            param.Add("@FinancialYear", financialYear);

            return _dbAccess.GetDataTable("usp_ITISpecification_IsRequirementSubmitted", param);
        }


        //updated ppp fund work 

        public DataTable GetFinancialDataForPppFund(int InstituteID)
        {
            var param = new Dictionary<String, object>();
            param.Add("@ID", null);
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("USP_FinancialData_Get", param);
            
        }

        public string SaveFinancialDataForPppFund(FinancialDataForPppFundEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", entity.Id == 0 ? (object)DBNull.Value : entity.Id);
            param.Add("@FinancialYearID", entity.FinancialYearID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@AsonDate", entity.AsonDate);
            param.Add("@FundsReceived", entity.FundsReceived);
            param.Add("@InterestEarned", entity.InterestEarned);
            param.Add("@RevenueGenerated", entity.RevenueGenerated);
            param.Add("@TotalExpenditure", entity.TotalExpenditure);
            param.Add("@Repayment", entity.Repayment);
            param.Add("@BalanceasonDate", entity.BalanceasonDate);
            param.Add("@UserID", entity.UserID);
            param.Add("@UserIpAddress", entity.UserIpAddress);

            var result = _dbAccess.GetDataTable("USP_FinancialData_Save", param);

            if (result != null && result.Rows.Count > 0)
            {
                // SP returns only ID
                return result.Rows[0]["ID"].ToString();
            }

            return "Error";
        }

        //GET MANAGEMENT MOBILE NUMBER 
        public DataTable GetInstituteAndManagementMobile(long instituteId, int managementType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteId);
            param.Add("@ManagementType", managementType);

            return _dbAccess.GetDataTable("usp_GetInstituteAndManagementMobile", param);
        }


        // unlock the requirement deatils 
        public string UpdateITIRequirementsStatusToDraft(int collegeID)
        {
            var param = new Dictionary<string, object>
    {
        { "@CollegeID", collegeID },
        { "@ModifiedBy", DBNull.Value },
        { "@ModifiedByIPAddress", DBNull.Value }
    };

            var result = _dbAccess.ExecuteScalar("usp_UpdateITIRequirementsStatusToDraft", param);

            return result?.ToString() ?? "Operation failed.";
        }


        // available fund for requirements
        public DataTable GetAvailableFundForRequirements(int FinancialYearID, int RegionID, int DistrictID, int TalukaID, int CollegeID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYearID",    FinancialYearID);
            param.Add("@RegionID",       RegionID);
            param.Add("@DistrictID",      DistrictID);
            param.Add("@TalukaID",        TalukaID);
            param.Add("@CollegeID",       CollegeID);
            

            return _dbAccess.GetDataTable("USP_GetDashboardAvailableFunds", param);
        }



    }
}
