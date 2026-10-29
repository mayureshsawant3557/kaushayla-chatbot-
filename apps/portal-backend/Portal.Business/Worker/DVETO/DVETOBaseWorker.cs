using System.Data;
using Portal.Business.Interface.DVETO;
using Portal.Entities.DVETO;
using Portal.Business.Worker.Utility;
using Portal.Data;

namespace Portal.Business.Worker.DVETO
{
    public class DVETOBaseWorker : IDVETOBase
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public DVETOBaseWorker(Repository objData)
        {
            _objData = objData;
        }

        public DVETOBaseEntity GetOfficeDetails(long officeId, string userLoginId)
        {
            DVETOBaseEntity obj = null;

            try
            {
                DataTable dt = _objData.GetOfficeDetails(officeId, userLoginId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj = new DVETOBaseEntity
                    {
                        OfficeID = dr["OfficeID"] != DBNull.Value ? Convert.ToInt64(dr["OfficeID"]) : 0,
                        OfficeCode = dr["OfficeCode"]?.ToString() ?? "",
                        OfficeName = dr["OfficeName"]?.ToString() ?? "",
                        OfficeAddress = dr["OfficeAddress"]?.ToString() ?? "",

                        StateID = dr["StateID"] != DBNull.Value ? Convert.ToInt32(dr["StateID"]) : 0,
                        State = dr["State"]?.ToString() ?? "",

                        DistrictID = dr["DistrictID"] != DBNull.Value ? Convert.ToInt32(dr["DistrictID"]) : 0,
                        District = dr["District"]?.ToString() ?? "",

                        TalukaID = dr["TalukaID"] != DBNull.Value ? Convert.ToInt32(dr["TalukaID"]) : 0,
                        Taluka = dr["Taluka"]?.ToString() ?? "",

                        CityID = dr["CityID"] != DBNull.Value ? Convert.ToInt32(dr["CityID"]) : 0,
                        City = dr["City"]?.ToString() ?? "",

                        OtherCity = dr["OtherCity"]?.ToString() ?? "",

                        PinCode = dr["PinCode"]?.ToString() ?? "",

                        LocationCategoryID = dr["LocationCategoryID"] != DBNull.Value ? Convert.ToInt32(dr["LocationCategoryID"]) : 0,
                        LocationCategory = dr["LocationCategory"]?.ToString() ?? "",

                        STD = dr["STD"]?.ToString() ?? "",
                        PhoneNo = dr["PhoneNo"]?.ToString() ?? "",
                        EMailID = dr["EMailID"]?.ToString() ?? "",
                        Website = dr["WebSite"]?.ToString() ?? "",

                        EstablishmentDate = dr["EstablishmentDate"] != DBNull.Value
                            ? Convert.ToDateTime(dr["EstablishmentDate"])
                            : DateTime.MinValue,

                        Latitude = dr["Latitude"]?.ToString() ?? "",
                        Longitude = dr["Longitude"]?.ToString() ?? ""
                    };
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching office details: " + ex.Message);
            }

            return obj;
        }
        //private readonly Repository objData;

        // Inject Repository via Constructor
        //public DVETOBaseWorker(Repository repository)
        //{
        //    objData = repository ?? throw new ArgumentNullException(nameof(repository));
        //}

        public List<DVETOManagementDetailsEntity> GetDVETOManagementDetails(long dvetoID)
        {
            List<DVETOManagementDetailsEntity> retVal = new List<DVETOManagementDetailsEntity>();
            try
            {
                retVal = _objData.GetDVETOManagementDetails(dvetoID);
                if (retVal == null)
                {
                    retVal = new List<DVETOManagementDetailsEntity>();
                }
                return retVal;
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching office details: " + ex.Message);
            }
        }

        public string SaveOfficeDetails(DVETOBaseEntity entity)
        {
            string retVal = "";

            try
            {
                retVal = _objData.SaveOfficeDetails(entity);

                if (!string.IsNullOrEmpty(retVal) && retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                retVal = ex.Message;
            }

            return retVal;
        }

        public string SaveDVETOManagementDetails(DVETOManagementDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveDVETOManagementDetails(entity);
                if (retVal.ToUpper() == "N" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {
                    retVal = "Data saved successfully.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveDVETOManagementDetails", entity?.CreateBy);
                retVal = ex.Message;
            }
            return retVal;
        }

        //INSPECTION COMMITTEE
        public DVETOInspectionCommitteeResponse GetDVETOInspectionCommitteeDetails(long instituteID)
        {
            try
            {
                DataSet ds = _objData.GetDVETOInspectionCommitteeDetails(instituteID);

                List<DVETOInspectionCommitteeEntity> list = new List<DVETOInspectionCommitteeEntity>();
                DVETOInspectionCommitteePhotoEntity photo = null;

                
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataTable dt = ds.Tables[0];

                    foreach (DataRow row in dt.Rows)
                    {
                        list.Add(new DVETOInspectionCommitteeEntity
                        {
                            ID = row["ID"] != DBNull.Value ? Convert.ToInt64(row["ID"]) : 0,
                            InstituteID = row["InstituteID"] != DBNull.Value ? Convert.ToInt64(row["InstituteID"]) : 0,
                            StaffID = row["StaffID"] != DBNull.Value ? Convert.ToInt64(row["StaffID"]) : 0,
                            ManagementType = row["ManagementType"] != DBNull.Value ? Convert.ToInt32(row["ManagementType"]) : 0,
                            Title = row["Title"]?.ToString(),
                            FirstName = row["FirstName"]?.ToString(),
                            MiddleName = row["MiddleName"]?.ToString(),
                            LastName = row["LastName"]?.ToString(),
                            MobileNo = row["MobileNo"]?.ToString(),
                            Gender = row["Gender"]?.ToString(),
                            DOB = row["DOB"]?.ToString(),
                            ProfileID = row["ProfileID"]?.ToString(),
                            CollegeRegistrationNo = row["CollegeRegistrationNo"]?.ToString(),
                            CollegeName = row["CollegeName"]?.ToString(),
                            Status = row["Status"]?.ToString()
                        });
                    }
                }

                
                if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[1].Rows[0];

                    photo = new DVETOInspectionCommitteePhotoEntity
                    {
                        InstituteID = row["InstituteID"] != DBNull.Value ? Convert.ToInt64(row["InstituteID"]) : 0,
                        PhotoPath = row["PhotoPath"]?.ToString()
                    };
                }

                
                return new DVETOInspectionCommitteeResponse
                {
                    Members = list,
                    Photo = photo
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching inspection committee details: " + ex.Message);
            }
        }

        // save inspection committee details
        public bool SaveDVETOInspectionCommittee(DVETOInspectionCommitteeEntity entity)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                return _objData.SaveDVETOInspectionCommittee(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveDVETOInspectionCommittee", entity?.CreateBy);
                throw;
            }
        }
        public DataTable deleteDVETOInspectionCommittee(long ID)
        {
            try
            {
                return _objData.deleteDVETOInspectionCommittee(ID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "deleteDVETOInspectionCommittee", "System");
                throw;
            }
        }

        public string saveDVETOInspectionCommitteephot(int InstituteID, string PhotoPath, string User, string IP)
        {
            try
            {
                return _objData.saveDVETOInspectionCommitteephot(InstituteID, PhotoPath, User, IP);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "saveDVETOInspectionCommitteephot", User);
                throw;
            }
        }

        public DataTable DVETO_GetDveto_ManagementTypeByDvetoID(long DVETOID, int managementType)
        {
            DataTable dt = null;
            try
            {
                dt = _objData.DVETO_GetDveto_ManagementTypeByDvetoID(DVETOID, managementType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstitutePromoterTypeByInstituteID", DVETOID.ToString());
            }
            return dt;
        }
        public DataTable DVETO_GetInstituteForDpdcFund(int OfficeID, string InstType, string InstituteCode)
        {
            DataTable dt = null;
            try
            {
                dt = _objData.DVETO_GetInstituteForDpdcFund(OfficeID, InstType , InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetInstituteForDpdcFund", OfficeID.ToString());
            }
            return dt;
        }
        public DataSet DVETO_GetCompleteFundAllocationData(int FinancialYearID, int DistrictID, int MajorHeadID)
        {
            DataSet dt = null;
            try
            {
                dt = _objData.DVETO_GetCompleteFundAllocationData( FinancialYearID,  DistrictID,  MajorHeadID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetInstituteForDpdcFund", DistrictID.ToString());
            }
            return dt;
        }

        public DataTable DVETO_SaveCompleteFundAllocationData(DVETOFundAllocationEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "DVETOFundAllocationEntity cannot be null");

            DataTable dt = new DataTable();

            try
            {
                dt = _objData.DVETO_SaveCompleteFundAllocationData(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Fund allocation data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in DVETO_SaveCompleteFundAllocationData: {ex.Message}");

                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveCompleteFundAllocationData");

                throw;
            }

            return dt;
        }
        // updated dveto fund allocation
        public DataSet DVETO_GetFundAllocationData_2203(int FinancialYearID, int DistrictID, string InstituteCode)
        {
            DataSet dt = null;
            try
            {
                dt = _objData.DVETO_GetFundAllocationData_2203(FinancialYearID, DistrictID, InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetInstituteForDpdcFund", DistrictID.ToString());
            }
            return dt;
        }
        public DataTable DVETO_SaveFundAllocationData_2203(SaveFundAllocationRequest entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "DVETOFundAllocationEntity cannot be null");

            DataTable dt = new DataTable();

            try
            {
                dt = _objData.DVETO_SaveFundAllocationData_2203(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Fund allocation data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in DVETO_SaveCompleteFundAllocationData: {ex.Message}");

                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveCompleteFundAllocationData");

                throw;
            }

            return dt;
        }

        public DataSet DVETO_GetFundAllocationMasters_2203()
        {

            DataSet dt = new DataSet();

            try
            {
                dt = _objData.DVETO_GetFundAllocationMasters_2203();

                if (dt == null )
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Fund allocation data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in DVETO_GetFundAllocationMasters_2203: {ex.Message}");

                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetFundAllocationMasters_2203");

                throw;
            }

            return dt;
        }
        public DataSet DVETO_GetFundAllocationMasters_2230()
        {

            DataSet dt = new DataSet();

            try
            {
                dt = _objData.DVETO_GetFundAllocationMasters_2230();

                if (dt == null )
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Fund allocation data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in DVETO_GetFundAllocationMasters_2230: {ex.Message}");

                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetFundAllocationMasters_2230");

                throw;
            }

            return dt;
        }


            public DataSet DVETO_GetFundAllocationData_2230(int FinancialYearID, int DistrictID,string  InstituteCode)
        {
            DataSet dt = null;
            try
            {
                dt = _objData.DVETO_GetFundAllocationData_2230(FinancialYearID, DistrictID, InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetFundAllocationData_2230", DistrictID.ToString());
            }
            return dt;
        }
        public DataTable DVETO_SaveFundAllocationData_2230(SaveFundAllocationRequest entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "DVETOFundAllocationEntity cannot be null");

            DataTable dt = new DataTable();

            try
            {
                dt = _objData.DVETO_SaveFundAllocation_2230(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Fund allocation data saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in DVETO_SaveFundAllocation_2230: {ex.Message}");

                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveFundAllocation_2230");

                throw;
            }

            return dt;
        }

        public DataSet GetHeadDocuments_2203(int OfficeID, int FinancialYearID)
        {
            DataSet ds = null;

            try
            {
                ds = _objData.GetHeadDocuments_2203(
                    OfficeID,
                    FinancialYearID
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetHeadDocuments_2203",
                    OfficeID.ToString());
            }

            return ds;
        }

        public DataTable Save_HeadDocuments_2203(SaveHeadDocumentEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(
                    nameof(entity),
                    "SaveHeadDocumentEntity cannot be null");

            DataTable dt = new DataTable();

            try
            {
                dt = _objData.Save_HeadDocuments_2203(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Head document saved successfully.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "Save_HeadDocuments_2203",
                    entity.CreatedBy);

                throw;
            }

            return dt;
        }

        public DataSet GetHeadDocuments_2230(int OfficeID, int FinancialYearID)
        {
            DataSet ds = null;

            try
            {
                ds = _objData.GetHeadDocuments_2230(
                    OfficeID,
                    FinancialYearID
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetHeadDocuments_2230",
                    OfficeID.ToString());
            }

            return ds;
        }

        public DataTable Save_HeadDocuments_2230(SaveHeadDocumentEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(
                    nameof(entity),
                    "SaveHeadDocumentEntity cannot be null");

            DataTable dt = new DataTable();

            try
            {
                dt = _objData.Save_HeadDocuments_2230(entity);

                if (dt == null || dt.Rows.Count == 0)
                {
                    Console.WriteLine("No response returned from database.");
                    return null;
                }

                Console.WriteLine("Head document saved successfully.");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "Save_HeadDocuments_2230",
                    entity.CreatedBy);

                throw;
            }

            return dt;
        }
        public DataSet StateFund_GetOfficeUsers()
        {
            DataSet ds = null;

            try
            {
                ds = _objData.StateFund_GetOfficeUsers();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "StateFund_GetOfficeUsers");
            }

            return ds;
        }



        public DataSet GetAdminDashboard(Int32 UserTypeID, string UserLoginID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = _objData.GetAdminDashboard(UserTypeID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAdminDashboard", UserLoginID);
                throw ex;
            }
            return ds;
        }
    }
}