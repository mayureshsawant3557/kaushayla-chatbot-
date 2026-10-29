using Portal.Entities;
using Portal.Entities.BTRI;
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
        public DataTable GetBTRIDetails(Int64 BTRIID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BTRIID", BTRIID);

            return _dbAccess.GetDataTable("BTRI_GetBTRIDetails", param);
        }
        public string SaveBTRIDetails(BTRIEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BTRIID", entity.BTRIID);
            param.Add("@Address", entity.Address);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@Taluka", entity.Taluka);
            param.Add("@CityID", entity.CityID);
            param.Add("@City", entity.City);
            param.Add("@Pincode", entity.Pincode);
            param.Add("@Title", entity.Title);
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("BTRI_SaveBTRIDetails", param).ToString();
        }
        public DataTable EstablishmentSearch(Int32 UserTypeID, string UserLoginID, string ApplicationStatus, string RegistrationNo, string EstablishmentName)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@ApplicationStatus", ApplicationStatus);
            param.Add("@RegistrationNo", RegistrationNo);
            param.Add("@EstablishmentName", EstablishmentName);

            return _dbAccess.GetDataTable("BTRI_EstablishmentSearch", param);
        }
        public DataSet GetEstablishmentDashboard(Int32 UserTypeID, string UserLoginID, Int64 EstablishmentID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@EstablishmentID", EstablishmentID);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentDashboard", param);
        }
        public DataSet GetEstablishmentInspectionSchedule(Int64 EstablishmentID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentInspectionSchedule", param);
        }
        public string SaveEstablishmentInspectionSchedule(Int64 EstablishmentID, Int64 BTRIID, DateTime InspectionScheduledDate, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@BTRIID", BTRIID);
            param.Add("@InspectionScheduledDate", InspectionScheduledDate);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("BTRI_SaveEstablishmentInspectionSchedule", param).ToString();
        }
        public DataSet GetEstablishmentActualInspection(Int64 EstablishmentID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentActualInspection", param);
        }
        public string SaveEstablishmentActualInspection(Int64 EstablishmentID, DateTime ActualInspectionDate, Int32 UserTypeID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@ActualInspectionDate", ActualInspectionDate);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("BTRI_SaveEstablishmentActualInspection", param).ToString();
        }
        public DataSet GetEstablishmentScrutinyDetails(Int64 EstablishmentID, string PageCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@PageCode", PageCode);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentScrutinyDetails", param);
        }
        public string SaveEstablishmentScrutinyDetails(Int64 EstablishmentID, string Comments, string ApprovalStatus, string ReasonForRejection, Int32 UserTypeID, string UserLoginID, string IPAddress, string PageCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@Comments", Comments);
            param.Add("@ApprovalStatus", ApprovalStatus);
            param.Add("@ReasonForRejection", ReasonForRejection);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            param.Add("@PageCode", PageCode);

            return _dbAccess.ExecuteScalar("BTRI_SaveEstablishmentScrutinyDetails", param).ToString();
        }
        public DataSet GetEstablishmentFinalScrutinyDetails(Int32 UserTypeID, string UserLoginID, Int64 EstablishmentID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@EstablishmentID", EstablishmentID);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentFinalScrutinyDetails", param);
        }
        public string SaveEstablishmentFinalScrutinyDetails(Int64 EstablishmentID, string ApprovalStatus, Int32 UserTypeID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@ApprovalStatus", ApprovalStatus);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("BTRI_SaveEstablishmentFinalScrutinyDetails", param).ToString();
        }
        public bool CheckEstablishmentScrutinyEligiblity(Int64 EstablishmentID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@UserLoginID", UserLoginID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("BTRI_CheckEstablishmentScrutinyEligiblity", param).ToString());
        }
        public bool IsEstablishmentEligibleToRecall(Int64 EstablishmentID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@UserLoginID", UserLoginID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("BTRI_IsEstablishmentEligibleToRecall", param).ToString());
        }
        public DataSet GetEstablishmentScrutinyStatus(Int64 EstablishmentID, string Flag)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@Flag", Flag);

            return _dbAccess.GetDataSet("BTRI_GetEstablishmentScrutinyStatus", param);
        }
    }
}
