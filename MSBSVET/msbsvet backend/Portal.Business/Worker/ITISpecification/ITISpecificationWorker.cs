using Newtonsoft.Json;
using Portal.Business.Interface.ITISpecification;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Base;
using Portal.Entities.ITISpecification;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.ITISpecification
{
    public class ITISpecificationWorker : IITISpecificationBase
    {
        private readonly Repository objData;

        //private readonly CommonHelper _commonHelper;
        //Inject Repository via Constructor 
        public ITISpecificationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));

        }


        public List<DropdownEntity> GetMasterGroup()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterGroup();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterGroup");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterSector()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterSectorForTrade();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSector");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterTrade()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrade();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterTrade");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterCategory()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCategory();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCategory");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterItem()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterItem();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterItem");
                throw ex;
            }
            return objList;
        }

        public List<TradeWiseItemEntity> GetTradeWiseItems(long tradeId)
        {
            List<TradeWiseItemEntity> objList = new List<TradeWiseItemEntity>();
            try
            {
                DataTable dt = objData.GetTradeWiseItems(tradeId);
                objList = DataTableToTradeWiseItemList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTradeWiseItems");
                throw ex;
            }
            return objList;
        }

        public List<GroupWiseItemEntity> GetGroupWiseItems(int sectorId, int groupId, int categoryId, int itemId)
        {
            List<GroupWiseItemEntity> objList = new List<GroupWiseItemEntity>();
            try
            {
                DataTable dt = objData.GetGroupWiseItems(sectorId, groupId, categoryId, itemId);
                objList = DataTableToGroupWiseItemList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetGroupWiseItems");
                throw ex;
            }
            return objList;
        }


        public List<SectorWiseItemEntity> GetSectorWiseItems(int sectorId, int categoryId, int itemId)
        {
            List<SectorWiseItemEntity> objList = new List<SectorWiseItemEntity>();
            try
            {
                DataTable dt = objData.GetSectorWiseItems(sectorId, categoryId, itemId);
                objList = DataTableToSectorWiseItemList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSectorWiseItems");
                throw ex;
            }
            return objList;
        }
        public List<SectorWiseItemEntity> GetAllItems()
        {
            List<SectorWiseItemEntity> objList = new List<SectorWiseItemEntity>();
            try
            {
                DataTable dt = objData.GetAllItems();
                objList = DataTableToSectorWiseItemList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllItems");
                throw ex;
            }
            return objList;
        }

        private List<SectorWiseItemEntity> DataTableToSectorWiseItemList(DataTable dataTable)
        {
            var items = new List<SectorWiseItemEntity>();

            foreach (DataRow row in dataTable.Rows)
            {
                items.Add(new SectorWiseItemEntity
                {
                    ItemId = Convert.ToInt32(row["ItemId"]),
                    SectorID = Convert.ToInt32(row["SectorID"]),
                    CategoryId = Convert.ToInt32(row["CategoryId"]),
                    IsDocShow = Convert.ToInt32(row["IsDocShow"]),
                    NameofITem = row["NameofITem"]?.ToString() ?? "",
                    ItemCode = row["ItemCode"]?.ToString() ?? "",  // This should now work
                    EstimatedPrice = Convert.ToDecimal(row["EstimatedPrice"]),  // This should now work
                    SectorName = row["SectorName"]?.ToString() ?? "",
                    CategoryName = row["CategoryName"]?.ToString() ?? "",
                    SpecificationDocument = row["SpecificationDocument"]?.ToString() ?? "",
                    RowId = Convert.ToInt32(row["RowId"])
                });
            }

            return items;
        }



        private List<TradeWiseItemEntity> DataTableToTradeWiseItemList(DataTable dt)
        {
            List<TradeWiseItemEntity> list = new List<TradeWiseItemEntity>();
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    TradeWiseItemEntity entity = new TradeWiseItemEntity
                    {
                        TradeID = Convert.ToInt64(row["TradeID"]),
                        TradeName = row["TradeName"]?.ToString() ?? "",
                        UsagesID = Convert.ToInt64(row["UsagesID"]),
                        Usage = row["Usage"]?.ToString() ?? "",
                        SNAsperDGT = row["SNAsperDGT"]?.ToString() ?? "",
                        ItemAsperDGTID = Convert.ToInt64(row["ItemAsperDGTID"]),
                        ItemAsperDGT = row["ItemAsperDGT"]?.ToString() ?? "",
                        SpecificationDGTID = Convert.ToInt64(row["SpecificationDGTID"]),
                        SpecificationDGT = row["SpecificationDGT"]?.ToString() ?? "",
                        QTYAsPerDGT = row["QTYAsPerDGT"]?.ToString() ?? "",
                        SNAsperDVET = row["SNAsperDVET"]?.ToString() ?? "",
                        ItemAsperDVETID = Convert.ToInt64(row["ItemAsperDVETID"]),
                        ItemAsperDVET = row["ItemAsperDVET"]?.ToString() ?? "",
                        RevisedQtyAsperDVET = row["RevisedQtyAsperDVET"]?.ToString() ?? "",
                        SpecificationDocument = row["SpecificationDocument"]?.ToString() ?? ""
                    };
                    list.Add(entity);
                }
            }
            return list;
        }

        private List<GroupWiseItemEntity> DataTableToGroupWiseItemList(DataTable dt)
        {
            List<GroupWiseItemEntity> list = new List<GroupWiseItemEntity>();
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    GroupWiseItemEntity entity = new GroupWiseItemEntity
                    {
                        ItemId = Convert.ToInt32(row["ItemId"]),
                        GroupID = Convert.ToInt32(row["GroupID"]),
                        SectorID = Convert.ToInt32(row["SectorID"]),
                        CategoryId = Convert.ToInt32(row["CategoryId"]),
                        NameofITem = row["NameofITem"]?.ToString() ?? "",
                        GroupName = row["GroupName"]?.ToString() ?? "",
                        SectorName = row["SectorName"]?.ToString() ?? "",
                        CategoryName = row["CategoryName"]?.ToString() ?? "",
                        SpecificationDocument = row["SpecificationDocument"]?.ToString() ?? ""
                    };
                    list.Add(entity);
                }
            }
            return list;
        }
        public List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
        {
            var list = new List<DropdownEntity>(table.Rows.Count);
            DropdownEntity ddl;

            if (hasSelect)
            {
                ddl = new DropdownEntity()
                {
                    Value = "-1",
                    Text = "Select",
                    Group = "-1",
                    Group2 = "-1"
                };
                list.Add(ddl);
            }
            if (table != null && table.Rows.Count > 0)
            {
                foreach (DataRow row in table.Rows)
                {
                    var values = row.ItemArray;
                    ddl = new DropdownEntity()
                    {
                        Value = values[0].ToString(),
                        Text = values[1].ToString(),
                        Group = values[2].ToString(),
                        Group2 = values.Length > 3 ? values[3].ToString() : "-1"
                    };
                    list.Add(ddl);
                }
            }
            return list;
        }

        public ApiResponse<object> SaveRequirements(SaveRequirementRequest request)
        {
            try
            {
                var requirementsJson = JsonConvert.SerializeObject(request.Requirements);
                var result = objData.SaveRequirements(
                    request.UserID,
                    request.CollegeID,
                    requirementsJson,
                    request.FinancialYear,
                    request.IPAddress,
                    "SAVE"
                );

                return ApiResponse<object>.SuccessResponse(result, "Requirements saved successfully.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveRequirements");
                return ApiResponse<object>.ErrorResponse($"Failed to save requirements: {ex.Message}");
            }
        }

        public ApiResponse<object> SubmitRequirements(SaveRequirementRequest request)
        {
            try
            {
                var requirementsJson = JsonConvert.SerializeObject(request.Requirements);
                var result = objData.SaveRequirements(
                    request.UserID,
                    request.CollegeID,
                    requirementsJson,
                    request.FinancialYear,
                    request.IPAddress,
                    "SUBMIT"
                );

                return ApiResponse<object>.SuccessResponse(result, "Requirements submitted successfully.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SubmitRequirements");
                return ApiResponse<object>.ErrorResponse($"Failed to submit requirements: {ex.Message}");
            }
        }

        public List<RequirementEntity> GetUserRequirements(long userId, string financialYear)
        {
            List<RequirementEntity> objList = new List<RequirementEntity>();
            try
            {
                DataTable dt = objData.GetUserRequirements(userId, financialYear);
                objList = DataTableToRequirementList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserRequirements");
                throw ex;
            }
            return objList;
        }

        // Simplified DataTable conversion without history columns
        private List<RequirementEntity> DataTableToRequirementList(DataTable dataTable)
        {
            List<RequirementEntity> items = new List<RequirementEntity>();

            try
            {
                foreach (DataRow row in dataTable.Rows)
                {
                    RequirementEntity item = new RequirementEntity
                    {
                        ID = Convert.ToInt64(row["RequirementID"]),
                        UserID = Convert.ToInt64(row["UserID"]),
                        CollegeID = row["CollegeID"] != DBNull.Value ? row["CollegeID"].ToString() : null,
                        ItemID = Convert.ToInt32(row["ItemID"]),
                        SectorID = Convert.ToInt32(row["SectorID"]),
                        CategoryID = Convert.ToInt32(row["CategoryID"]),
                        DistrictFund = row["DistrictFund"] != DBNull.Value ? Convert.ToDecimal(row["DistrictFund"]) : 0,
                        PPP = row["PPP"] != DBNull.Value ? Convert.ToDecimal(row["PPP"]) : 0,
                        StateFund = row["StateFund"] != DBNull.Value ? Convert.ToDecimal(row["StateFund"]) : 0,
                        RequiredAsPerNorms = row["RequiredAsPerNorms"] != DBNull.Value ? Convert.ToDecimal(row["RequiredAsPerNorms"]) : 0,
                        Available = row["Available"] != DBNull.Value ? Convert.ToDecimal(row["Available"]) : 0,
                        Total = row["Total"] != DBNull.Value ? Convert.ToDecimal(row["Total"]) : 0,
                        FinancialYear = row["FinancialYear"]?.ToString() ?? "",
                        Status = row["Status"]?.ToString() ?? "",
                        SubmittedDate = row["SubmittedDate"] != DBNull.Value ? Convert.ToDateTime(row["SubmittedDate"]) : (DateTime?)null,
                        ApprovedDate = row["ApprovedDate"] != DBNull.Value ? Convert.ToDateTime(row["ApprovedDate"]) : (DateTime?)null,
                        ApprovedBy = row["ApprovedBy"] != DBNull.Value ? Convert.ToInt64(row["ApprovedBy"]) : (long?)null,
                        Remarks = row["Remarks"]?.ToString() ?? "",
                        IsActive = true, // Always true since we filter in query
                        CreatedDateTime = Convert.ToDateTime(row["CreatedDateTime"]),
                        CreatedBy = row["UserID"] != DBNull.Value
                        ? row["UserID"].ToString()
                        : null, // still using UserID as CreatedBy

                        CreatedByIPAddress = "",

                        ModifiedDateTime = row["ModifiedDateTime"] != DBNull.Value
                        ? Convert.ToDateTime(row["ModifiedDateTime"])
                        : (DateTime?)null,

                        ModifiedBy = row["ModifiedDateTime"] != DBNull.Value
                        ? row["UserID"].ToString()     // same logic, now cast to string
                        : null,

                        ModifiedByIPAddress = "",

                        // Display properties
                        ItemName = row["ItemName"]?.ToString() ?? "",
                        ItemCode = row["ItemCode"]?.ToString() ?? "",
                        SectorName = row["SectorName"]?.ToString() ?? "",
                        CategoryName = row["CategoryName"]?.ToString() ?? "",
                        CollegeName = row["CollegeName"]?.ToString() ?? "",
                        CollegeRegistrationNo = row["CollegeRegistrationNo"]?.ToString() ?? "",
                        EstimatedPrice = row["EstimatedPrice"] != DBNull.Value ? Convert.ToDecimal(row["EstimatedPrice"]) : 0,
                        SpecificationDocument = row["SpecificationDocument"]?.ToString() ?? "",
                        CreatedByName = "",
                        ModifiedByName = "",
                        ApprovedByName = ""
                    };

                    items.Add(item);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DataTableToRequirementList");
                throw ex;
            }

            return items;
        }

        public ApiResponse<object> DeleteRequirements(DeleteRequirementRequest request)
        {
            try
            {
                var result = objData.DeleteRequirements(
                    request.RequirementIDs,
                    request.UserID,
                    request.IPAddress,
                    request.Reason
                );

                // Check if deletion was successful
                var resultTable = result.AsEnumerable().FirstOrDefault();
                if (resultTable != null)
                {
                    string status = resultTable["Status"].ToString();
                    if (status == "Success")
                    {
                        return ApiResponse<object>.SuccessResponse(result, "Requirements deleted successfully.");
                    }
                    else
                    {
                        return ApiResponse<object>.ErrorResponse(resultTable["Message"].ToString());
                    }
                }

                return ApiResponse<object>.ErrorResponse("Failed to delete requirements.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteRequirements");
                return ApiResponse<object>.ErrorResponse($"Failed to delete requirements: {ex.Message}");
            }
        }

        public List<ProposedTotalsEntity> GetProposedTotals(long userId, string financialYear)
        {
            List<ProposedTotalsEntity> objList = new List<ProposedTotalsEntity>();
            try
            {
                DataTable dt = objData.GetProposedTotals(userId, financialYear);
                objList = DataTableToProposedTotalsList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedTotals");
                throw ex;
            }
            return objList;
        }

        private List<ProposedTotalsEntity> DataTableToProposedTotalsList(DataTable dt)
        {
            List<ProposedTotalsEntity> list = new List<ProposedTotalsEntity>();
            if (dt == null || dt.Rows.Count == 0) return list;

            foreach (DataRow row in dt.Rows)
            {
                ProposedTotalsEntity item = new ProposedTotalsEntity()
                {
                    DistrictItemsCount = row["DistrictItemsCount"] != DBNull.Value ? Convert.ToInt32(row["DistrictItemsCount"]) : 0,
                    DistrictFund = row["DistrictFund"] != DBNull.Value ? Convert.ToDecimal(row["DistrictFund"]) : 0,
                    PPPItemsCount = row["PPPItemsCount"] != DBNull.Value ? Convert.ToInt32(row["PPPItemsCount"]) : 0,
                    PPPFund = row["PPPFund"] != DBNull.Value ? Convert.ToDecimal(row["PPPFund"]) : 0,
                    StateItemsCount = row["StateItemsCount"] != DBNull.Value ? Convert.ToInt32(row["StateItemsCount"]) : 0,
                    StateFund = row["StateFund"] != DBNull.Value ? Convert.ToDecimal(row["StateFund"]) : 0
                };
                list.Add(item);
            }

            return list;
        }


        public ApiResponse<object> DeleteRequirements(string requirementIds, long userId, string ipAddress, string reason = null)
        {
            throw new NotImplementedException();
        }

        public ApiResponse<object> SaveSingleRequirement(SingleRequirementRequest request)
        {
            try
            {
                var result = objData.SaveSingleRequirement(
                    request.UserID,
                    request.CollegeID,
                    request.ItemID,
                    request.SectorID,
                    request.CategoryID,
                    request.DistrictFund,
                    request.PPP,
                    request.StateFund,
                    request.RequiredAsPerNorms,
                    request.Available,
                    request.FinancialYear,
                    request.IPAddress,
                    request.Operation
                );

                // Check if operation was successful
                var resultTable = result.AsEnumerable().FirstOrDefault();
                if (resultTable != null)
                {
                    string status = resultTable["Status"].ToString();
                    if (status == "Success")
                    {
                        var responseData = new
                        {
                            RequirementID = resultTable["RequirementID"],
                            UserID = resultTable["UserID"],
                            CollegeID = resultTable["CollegeID"],
                            Message = resultTable["Message"].ToString()
                        };

                        return ApiResponse<object>.SuccessResponse(responseData, resultTable["Message"].ToString());
                    }
                    else
                    {
                        return ApiResponse<object>.ErrorResponse(resultTable["Message"].ToString());
                    }
                }

                return ApiResponse<object>.ErrorResponse("Failed to process requirement.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSingleRequirement");
                return ApiResponse<object>.ErrorResponse($"Failed to save requirement: {ex.Message}");
            }
        }

        public List<SectorEntity> GetSectorsWithTrades()
        {
            List<SectorEntity> sectorList = new List<SectorEntity>();
            try
            {
                DataTable dt = objData.GetSectorsWithTrades();
                sectorList = DataTableToSectorList(dt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSectorsWithTrades");
                throw;
            }
            return sectorList;
        }

        private List<SectorEntity> DataTableToSectorList(DataTable dt)
        {
            List<SectorEntity> list = new List<SectorEntity>();
            if (dt == null || dt.Rows.Count == 0) return list;

            foreach (DataRow row in dt.Rows)
            {
                SectorEntity sector = new SectorEntity
                {
                    SectorID = row["SectorID"] != DBNull.Value ? Convert.ToInt32(row["SectorID"]) : 0,
                    Sector = row["Sector"] != DBNull.Value ? row["Sector"].ToString() : string.Empty
                };
                list.Add(sector);
            }

            return list;
        }

        public DataTable UpdateRequirementStatus(long userId, string financialYear, string newStatus, long modifiedBy, string remarks, long? approvedBy)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.UpdateITIRequirementStatus(userId, financialYear, newStatus, modifiedBy, remarks, approvedBy);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, $"UpdateRequirementStatus - UserID: {userId}, Status: {newStatus}");
                throw ex;
            }
            return dt;
        }

        public DataTable GetUsersByStatus(string status, string financialYear)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetITIUsersByStatus(status, financialYear);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, $"GetUsersByStatus - Status: {status}, FinancialYear: {financialYear}");
                throw ex;
            }
            return dt;
        }

        public DataTable GetStatusSummary(string financialYear)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetITIStatusSummary(financialYear);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, $"GetStatusSummary - FinancialYear: {financialYear}");
                throw ex;
            }
            return dt;
        }

        public bool IsRequirementSubmitted(long userId, string financialYear)
        {
            try
            {
                var dt = objData.CheckITIRequirementSubmitted(userId, financialYear);
                if (dt != null && dt.Rows.Count > 0)
                {
                    return Convert.ToInt32(dt.Rows[0][0]) > 0;
                }
                return false;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, $"IsRequirementSubmitted - UserID: {userId}, FinancialYear: {financialYear}");
                throw ex;
            }
        }

        //pppfund   


        public DataTable GetInterestData(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetInterestData(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInterestData");
                throw ex;
            }
            return dt;
        }

        public string SaveInterestData(InterestEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInterestData(entity);
                if (retVal.ToUpper() == "ERROR" || retVal.Contains("not been saved"))
                {
                    retVal = "Interest data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInterestData");
                retVal = ex.Message;
            }
            return retVal;
        }





        public DataTable GetRevenueData(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetRevenueData(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetRevenueData");
                throw ex;
            }
            return dt;
        }

        public string SaveRevenueData(RevenueEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveRevenueData(entity);
                if (retVal.ToUpper() == "N" || retVal.Contains("Error"))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveRevenueData");
                retVal = ex.Message;
            }
            return retVal;
        }





        public DataTable GetExpenditureData(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExpenditureData(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExpenditureData");
                throw ex;
            }
            return dt;
        }

        public string SaveExpenditureData(ExpenditureEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveExpenditureData(entity);
                if (retVal.ToUpper() == "N" || retVal.Contains("Error"))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExpenditureData");
                retVal = ex.Message;
            }
            return retVal;
        }



        public DataTable GetRepaymentData(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetRepaymentData(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetRepaymentData");
                throw ex;
            }
            return dt;
        }

        public string SaveRepaymentData(RepaymentEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveRepaymentData(entity);
                if (retVal.ToUpper() == "N" || retVal.Contains("Error"))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveRepaymentData");
                retVal = ex.Message;
            }
            return retVal;
        }





        public DataTable GetPPPFundStatus(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetPPPFundStatus(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPPPFundStatus");
                throw ex;
            }
            return dt;
        }

        public DataTable GetFundData(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetFundData(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFundData");
                throw ex;
            }
            return dt;
        }


        public DataTable GetFinancialPeriods(string InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetFinancialPeriods(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFinancialPeriods");
                throw ex;
            }
            return dt;
        }


        //public DataTable GetFinancialPeriodById(int FinancialPeriodID, string InstituteID)
        //{
        //    DataTable dt = new DataTable();
        //    try
        //    {
        //        dt = objData.GetFinancialPeriodById(FinancialPeriodID, InstituteID);
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetFinancialPeriodById");
        //        throw ex;
        //    }
        //    return dt;
        //}


        public DataTable GetFinancialDataForPppFund(int InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetFinancialDataForPppFund(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFinancialDataForPppFund");

            }
            return dt;


        }


        public string SaveFinancialDataForPppFund(FinancialDataForPppFundEntity entity) {
            string retval = "";
            try
            {
                retval = objData.SaveFinancialDataForPppFund(entity);
                if (retval.ToUpper() == "N" || retval.Contains("Error"))
                    {
                    retval = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFinancialDataForPppFund");
                retval = ex.Message;
            }
            return retval;
        }

        public DataTable GetInstituteAndManagementMobile(long instituteId, int managementType)
        {
            DataTable dt = null;
            try
            {
                dt = objData.GetInstituteAndManagementMobile(instituteId, managementType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteAndManagementMobile", instituteId.ToString());
            }
            return dt;
        }

        // unlock the requirement deatils 

        public string UpdateITIRequirementsStatusToDraft(int collegeID)
        {
            if (collegeID <= 0)
                return "Invalid CollegeID.";

            string retVal = "";
            try
            {
                retVal = objData.UpdateITIRequirementsStatusToDraft(collegeID);

                if (string.IsNullOrEmpty(retVal))
                {
                    retVal = "Operation failed. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateITIRequirementsStatusToDraft");
                retVal = "An error occurred: " + ex.Message;
            }
            return retVal;
        }
        // available fund for requirements
        public DataTable GetAvailableFundForRequirements(int FinancialYearID, int RegionID, int DistrictID, int TalukaID, int CollegeID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetAvailableFundForRequirements(FinancialYearID, RegionID, DistrictID, TalukaID, CollegeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, $"GetAvailableFundForRequirements - FinancialYearID: {FinancialYearID}, RegionID: {RegionID}, DistrictID: {DistrictID}, TalukaID: {TalukaID}, CollegeID: {CollegeID}");
                throw ex;
            }
            return dt;
        }




    }
}

      
    

    
    

