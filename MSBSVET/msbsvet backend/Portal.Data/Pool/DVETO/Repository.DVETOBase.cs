using Newtonsoft.Json;
using Portal.Data.Source;
using Portal.Entities.DVETO;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data 
{
    public partial class Repository
    {

        public DataTable GetOfficeDetails(long officeId, string userLoginId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", officeId);
            param.Add("@UserLoginId", userLoginId ?? "");

            return _dbAccess.GetDataTable("Office_GetOfficeDetails", param);
        }

        public string SaveOfficeDetails(DVETOBaseEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", entity.OfficeID);
            param.Add("@OfficeCode", entity.OfficeCode);


            param.Add("@OffcieName", entity.OfficeName ?? "");

            param.Add("@EstablishmentDate",
                entity.EstablishmentDate == DateTime.MinValue
                ? (object)DBNull.Value
                : entity.EstablishmentDate);


            param.Add("@OffcieAddress", entity.OfficeAddress ?? "");

            param.Add("@PinCode", entity.PinCode ?? "");

            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@City", entity.City);

            param.Add("@OtherCity", entity.OtherCity ?? "");

            param.Add("@LocationCategoryID", entity.LocationCategoryID);

            param.Add("@STD", entity.STD ?? "");
            param.Add("@PhoneNo", entity.PhoneNo ?? "");
            param.Add("@EMailID", entity.EMailID ?? "");
            param.Add("@Website", entity.Website ?? "");

            param.Add("@ResolutionPath", entity.ResolutionPath ?? "");

            param.Add("@UserLoginID", entity.UserLoginID ?? "");
            param.Add("@IPAddress", entity.IPAddress ?? "");

            param.Add("@Latitude", entity.Latitude ?? "");
            param.Add("@Longitude", entity.Longitude ?? "");


            return _dbAccess.ExecuteScalar("Office_SaveOffcieDetails", param)?.ToString();
        }
        public List<DVETOManagementDetailsEntity> GetDVETOManagementDetails(long dvetoID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DVETOID", dvetoID);

            DataTable dt = _dbAccess.GetDataTable("DVETO_GetDVETOManagementDetails", param);

            List<DVETOManagementDetailsEntity> list = new List<DVETOManagementDetailsEntity>();

            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new DVETOManagementDetailsEntity
                    {
                        ID = Convert.ToInt64(row["ID"]),
                        DVETOID = Convert.ToInt64(row["DVETOID"]),
                        StaffID = Convert.ToInt64(row["StaffID"]),
                        ManagementType = Convert.ToInt32(row["ManagementType"]),
                        Title = row["Title"].ToString(),
                        FirstName = row["FirstName"].ToString(),
                        MiddleName = row["MiddleName"].ToString(),
                        LastName = row["LastName"].ToString(),
                        MobileNo = row["MobileNo"].ToString(),
                        Gender = row["Gender"].ToString(),
                        DOB = row["DOB"].ToString(),
                        ProfileID = row["ProfileID"].ToString(),
                        CollegeRegistrationNo = row["CollegeRegistrationNo"].ToString(),
                        CollegeName = row["CollegeName"].ToString(),
                        Status = row["Status"].ToString(),
                        FormStatus = row.Table.Columns.Contains("FormStatus") && row["FormStatus"] != DBNull.Value
                            ? row["FormStatus"].ToString()
                            : null
                    });
                }
            }

            return list;

        }
        public string SaveDVETOManagementDetails(DVETOManagementDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DVETOID", entity.DVETOID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@ManagementType", entity.ManagementType);
            param.Add("@User", entity.CreateBy);
            param.Add("@UserIpAddress", entity.IPAddress);

            var result = _dbAccess.ExecuteScalar("DVETO_InsertDVETOManagementDetails", param);


            if (result != null && result.ToString() != "0")
            {
                return "Y";
            }
            else
            {
                return "N";
            }
        }

        // INSPECTION COMMITTEE DETAILS
        public DataSet GetDVETOInspectionCommitteeDetails(long InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataSet("DVETO_GetDVETOInspectionCommittee", param);
        }

        public bool SaveDVETOInspectionCommittee(DVETOInspectionCommitteeEntity entity)
        {
            var param = new Dictionary<string, object>
    {
        { "@InstituteID", entity.InstituteID },
        { "@StaffID", entity.StaffID },
        { "@ManagementType", entity.ManagementType },
        { "@User", entity.CreateBy },
        { "@UserIpAddress", entity.IPAddress },
        //{ "@InspectionCommitteePhoto", entity.InspectionCommitteePhoto },
    };

            var result = _dbAccess.ExecuteScalar("DVETO_InsertDVETOInspectionCommittee", param);

            return result != null && result.ToString() != "0";
        }


        public DataTable deleteDVETOInspectionCommittee(long ID)
        {
            var param = new Dictionary<string, object>
            {
                { "@ID", ID }
            };
            return _dbAccess.GetDataTable("DVETO_DeleteDVETOInspectionCommittee", param);
            

        }
        public string saveDVETOInspectionCommitteephot(int InstituteID, string PhotoPath, string User, string IP)
        {
            var param = new Dictionary<string, object>
            {
                { "@InstituteID", InstituteID },
                { "@PhotoPath", PhotoPath },
                { "@User", User },
                { "@IP", IP }
            };
            var result = _dbAccess.ExecuteScalar("DVETO_SaveInspectionCommitteePhoto", param);
            return result?.ToString();
        }

        public DataTable DVETO_GetDveto_ManagementTypeByDvetoID(long DVETOID, int managementType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DVETOID", DVETOID);
            param.Add("@ManagementType", managementType);

            return _dbAccess.GetDataTable("DVETO_GetDveto_ManagementTypeByDvetoID", param);
        }
        public DataTable DVETO_GetInstituteForDpdcFund(long OfficeID, string InstType ,string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@OfficeID", OfficeID );
            param.Add("@InstType", InstType);
            //param.Add("@InstituteCode", InstituteCode);
            param.Add(
    "@InstituteCode",
    string.IsNullOrWhiteSpace(InstituteCode) ||
    InstituteCode.Equals("null", StringComparison.OrdinalIgnoreCase)
        ? DBNull.Value
        : InstituteCode
);


            return _dbAccess.GetDataTable("DVETO_GetInstituteForDpdcFund", param);
        }

        public DataSet DVETO_GetCompleteFundAllocationData(int FinancialYearID, int DistrictID, int MajorHeadID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYearID", FinancialYearID);
            param.Add("@DistrictID     ", DistrictID);
            param.Add("@MajorHeadID    ", MajorHeadID);

            return _dbAccess.GetDataSet("DVETO_GetCompleteFundAllocationData", param);
        }

        public DataTable DVETO_SaveCompleteFundAllocationData(
    DVETOFundAllocationEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(
                    nameof(entity),
                    "DVETOCompleteFundAllocationEntity cannot be null");

            var param = new Dictionary<string, object>
    {
        { "@FinancialYearID", entity.FinancialYearID },
        { "@DistrictID", entity.DistrictID },
        { "@MajorHeadID", entity.MajorHeadID },

        { "@Head1TotalAllocation", entity.Head1TotalAllocation },
        { "@Head2TotalAllocation", entity.Head2TotalAllocation },
        { "@Head3TotalAllocation", entity.Head3TotalAllocation },
        { "@Head4TotalAllocation", entity.Head4TotalAllocation },
        { "@Head5TotalAllocation", entity.Head5TotalAllocation },
        { "@Head6TotalAllocation", entity.Head6TotalAllocation },
        { "@Head7TotalAllocation", entity.Head7TotalAllocation },
        { "@Head8TotalAllocation", entity.Head8TotalAllocation },

        { "@DistrictFundForBooks", entity.DistrictFundForBooks },
        { "@DistrictFundForMET", entity.DistrictFundForMET },

        { "@InstituteData", entity.InstituteData },

        { "@CreatedBy", entity.CreatedBy }
    };

            return _dbAccess.GetDataTable(
                "DVETO_SaveCompleteFundAllocationData",
                param);
        }

        public DataSet DVETO_GetFundAllocationData_2203(int FinancialYearID, int DistrictID, string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYearID", FinancialYearID);
            param.Add("@DistrictID     ", DistrictID);
            // param.Add("@MajorHeadID    ", MajorHeadID);
            param.Add("@InstituteCode", InstituteCode);

            return _dbAccess.GetDataSet("DVETO_GetFundAllocationData_2203", param);
        }

        

        public DataTable DVETO_SaveFundAllocationData_2203(
    SaveFundAllocationRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(
                    nameof(request),
                    "Request cannot be null");

            if (request.Data == null || !request.Data.Any())
                throw new Exception("Allocation data is required");

            string jsonData =
                JsonConvert.SerializeObject(request.Data);

            var param = new Dictionary<string, object>
    {
        { "@JsonData", jsonData },
        { "@UserID", request.UserID }
    };

            return _dbAccess.GetDataTable(
                "DVETO_SaveFundAllocation_2203",
                param);
        }

        public DataSet DVETO_GetFundAllocationMasters_2203(
    )
        {
          

            return _dbAccess.GetDataSet(
                "DVETO_GetFundAllocationMasters_2203"
                );
        }

        //2230
        public DataSet DVETO_GetFundAllocationMasters_2230(
    )
        {


            return _dbAccess.GetDataSet(
                "DVETO_GetFundAllocationMasters_2230"
                );
        }

        public DataSet DVETO_GetFundAllocationData_2230(int FinancialYearID, int DistrictID, string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYearID", FinancialYearID);
            param.Add("@DistrictID     ", DistrictID);
            // param.Add("@MajorHeadID    ", MajorHeadID);
            param.Add("@InstituteCode", InstituteCode);

            return _dbAccess.GetDataSet("DVETO_GetFundAllocationData_2230", param);
        }


        public DataTable DVETO_SaveFundAllocation_2230(
    SaveFundAllocationRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(
                    nameof(request),
                    "Request cannot be null");

            if (request.Data == null || !request.Data.Any())
                throw new Exception("Allocation data is required");

            string jsonData =
                JsonConvert.SerializeObject(request.Data);

            var param = new Dictionary<string, object>
    {
        { "@JsonData", jsonData },
        { "@UserID", request.UserID }
    };

            return _dbAccess.GetDataTable(
                "DVETO_SaveFundAllocation_2230",
                param);
        }
        public DataSet GetHeadDocuments_2203(int OfficeID, int FinancialYearID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", OfficeID);
            param.Add("@FinancialYearID", FinancialYearID);

            return _dbAccess.GetDataSet("Get_HeadDocuments_2203", param);
        }

        public DataTable Save_HeadDocuments_2203(SaveHeadDocumentEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", entity.OfficeID);
            param.Add("@SectionID", entity.SectionID);
            param.Add("@HeadCode", entity.HeadCode);
            param.Add("@HeadName", entity.HeadName);
            param.Add("@DocumentUrl", entity.DocumentUrl);
            param.Add("@IsMandatory", entity.IsMandatory);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@CreatedBy", entity.CreatedBy);
            param.Add("@CreatedIPByAddress", entity.CreatedIPByAddress);
            param.Add("@FinancialYearID", entity.FinancialYearID);

            return _dbAccess.GetDataTable(
                "Save_HeadDocuments_2203",
                param
            );
        }
        public DataSet GetHeadDocuments_2230(int OfficeID, int FinancialYearID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", OfficeID);
            param.Add("@FinancialYearID", FinancialYearID);

            return _dbAccess.GetDataSet("Get_HeadDocuments_2230", param);
        }

        public DataTable Save_HeadDocuments_2230(SaveHeadDocumentEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@OfficeID", entity.OfficeID);
            param.Add("@SectionID", entity.SectionID);
            param.Add("@HeadCode", entity.HeadCode);
            param.Add("@HeadName", entity.HeadName);
            param.Add("@DocumentUrl", entity.DocumentUrl);
            param.Add("@IsMandatory", entity.IsMandatory);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@CreatedBy", entity.CreatedBy);
            param.Add("@CreatedIPByAddress", entity.CreatedIPByAddress);
            param.Add("@FinancialYearID", entity.FinancialYearID);

            return _dbAccess.GetDataTable(
                "Save_HeadDocuments_2230",
                param
            );
        }
        public DataSet StateFund_GetOfficeUsers()
        {
            var param = new Dictionary<string, object>();

            return _dbAccess.GetDataSet(
                "StateFund_GetOfficeUsers",
                param
            );
        }



        public DataSet GetAdminDashboard(Int32 UserTypeID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataSet("Dashboard_GetAdminDashboard", param);
        }

    }
}
