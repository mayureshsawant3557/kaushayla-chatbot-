using NPOI.OpenXmlFormats.Shared;
using Portal.Data.Source;
using Portal.Entities;
using Portal.Entities.ReportGenerator;
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
		public DataSet GetReportsList()
		{
			var param = new Dictionary<string, object>();

			return _dbAccess.GetDataSet("Report_GetReportsList", param);
		}
		public DataSet GenerateReport(Int32 ReportID, int UserTypeID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@ReportID", ReportID);
			param.Add("@UserTypeID", UserTypeID);

			return _dbAccess.GetDataSet("Report_GenerateReport", param);
		}
		public DataSet GetCandidateList(Int64 CourseID, Int64 CollegeID, int AdmissionYearID, string Flag, int RegionID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@AdmissionYearID", AdmissionYearID);
			param.Add("@Flag", Flag);
			param.Add("@RegionID", RegionID);

			return _dbAccess.GetDataSet("Admission_GetCandidateList", param);
		}

        public DataSet GetITIPrincipalDetails(int ManagementType, string InstType1, string InstType2)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ManagementType", ManagementType);
            param.Add("@InstType1", InstType1);
            param.Add("@InstType2", InstType2);

            return _dbAccess.GetDataSet("Report_GetITIPrincipalDetails", param);
        }
        public DataSet GetManagementTypes()
        {
            var param = new Dictionary<string, object>();

            return _dbAccess.GetDataSet("Master_GetManagementTypes", param);
        }
        public DataTable GetCompositReport(Int32 UserTypeID, string UserLoginID, Int32 AdmissionSessionID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserTypeID", UserTypeID);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@AdmissionSessionID", AdmissionSessionID);
			return _dbAccess.GetDataTable("Reports_CompositReport", param);
		}
		public DataTable GetCompositReportByDistrict(Int32 UserTypeID, Int32 RegionID, Int32 AdmissionSessionID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserTypeID", UserTypeID);
			param.Add("@RegionID", RegionID);
			param.Add("@AdmissionSessionID", AdmissionSessionID);
			return _dbAccess.GetDataTable("Reports_CompositReportByDistrict", param);
		}
		public DataTable GetCompositeReportByInstitute(Int32 UserTypeID, Int64 DistrictID, Int32 AdmissionSessionID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserTypeID", UserTypeID);
			param.Add("@DistrictID", DistrictID);
			param.Add("@AdmissionSessionID", AdmissionSessionID);
			return _dbAccess.GetDataTable("Reports_CompositeReportByInstitute", param);
		}
		public DataTable GetCompositeReportByCourse(Int32 UserTypeID, Int64 InstituteID, Int32 AdmissionSessionID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserTypeID", UserTypeID);
			param.Add("@InstituteID", InstituteID);
			param.Add("@AdmissionSessionID", AdmissionSessionID);
			return _dbAccess.GetDataTable("Reports_CompositeReportByCourse", param);
		}
		public DataTable GetCompositeReportByBatch(Int32 UserTypeID, Int64 InstituteID, Int64 CourseID, Int32 AdmissionSessionID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserTypeID", UserTypeID);
			param.Add("@InstituteID", InstituteID);
			param.Add("@CourseID", CourseID);
			param.Add("@AdmissionSessionID", AdmissionSessionID);
			return _dbAccess.GetDataTable("Reports_CompositeReportByBatch", param);
		}

		public DataTable DistrictWiseMarkSheetCertificateStatistic(Int32 DistrictID, Int32 ExaminationID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@DistrictID", DistrictID);
			param.Add("@ExaminationID", ExaminationID);
			return _dbAccess.GetDataTable("Report_DistrictWiseMarkSheetCertificateStatistic", param);
		}
		public DataTable GetAttendanceSubjectsByCenterWise(Int64 CenterID, Int32 ExaminationID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@CenterID", CenterID);
			param.Add("@ExaminationID", ExaminationID);
			return _dbAccess.GetDataTable("Exam_GetAttendanceSubjectsByCenterWise", param);
		}

        public DataSet GetSTEPCoordinatorsList()
        {
            var param = new Dictionary<string, object>();
            return _dbAccess.GetDataSet("STEP_CoordinatorsList", param);
        }
        public DataTable GetGreenFieldReportData(
    Int32 FinancialYearID,
    Int32 RegionID,
    Int32 DistrictID,
    Int32 TalukaID,
	int UserTypeID ,
	string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FinancialYearID", FinancialYearID);
            param.Add("@RegionID", RegionID);
            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
			param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataTable(
                "USP_GreenFieldReport",
                param);
        }

        public DataTable GetGazetteReportData(Int32 ExaminationID, char IsResultFresh, Int64 InstituteID, char GazetteType, Int32 DistrictID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@ExaminationID", ExaminationID);
			param.Add("@IsResultFresh", IsResultFresh);
			param.Add("@InstituteID", InstituteID);
			param.Add("@GazetteType", GazetteType);
			param.Add("@DistrictID", DistrictID);
			return _dbAccess.GetDataTable("Result_Report_Gazette", param);
		}
    }
}