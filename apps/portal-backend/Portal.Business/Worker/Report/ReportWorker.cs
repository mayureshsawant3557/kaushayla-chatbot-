
using Portal.Business.Interface.Report;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.ReportGenerator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Report
{
    public class ReportWorker : IReport
    {
        // Repository objData = new Repository();
        private readonly Repository objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public ReportWorker(Repository objData)
        {
            this.objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }


        public DataSet GetReportsList()
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetReportsList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetReportsList");
                throw ex;
            }
            return ds;
        }
        public DataSet GenerateReport(Int32 ReportID, int UserTypeID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GenerateReport(ReportID, UserTypeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GenerateReport");
                throw ex;
            }
            return ds;
        }
        public DataSet GetCandidateList(Int64 CourseID, Int64 CollegeID, int AdmissionYearID, string Flag, int RegionID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateList(CourseID, CollegeID, AdmissionYearID, Flag, RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GenerateReport");
                throw ex;
            }
            return ds;
        }
        public DataSet GetITIPrincipalDetails(int ManagementType, string InstType1, string InstType2)
        {
            DataSet ds = new DataSet();

            try
            {
                ds = objData.GetITIPrincipalDetails(ManagementType, InstType1, InstType2);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GenerateReport");
                throw;
            }

            return ds;
        }

        public DataSet GetManagementTypes()
        {
            DataSet ds = new DataSet();

            try
            {
                ds = objData.GetManagementTypes();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GenerateReport");
                throw;
            }

            return ds;
        }
        public DataTable GetCompositReport(Int32 UserTypeID, string UserLoginID, Int32 AdmissionSessionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCompositReport(UserTypeID, UserLoginID, AdmissionSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCompositReport");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCompositReportByDistrict(Int32 UserTypeID, Int32 RegionID, Int32 AdmissionSessionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCompositReportByDistrict(UserTypeID, RegionID, AdmissionSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCompositReportByDistrict");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCompositeReportByInstitute(Int32 UserTypeID, Int64 DistrictID, Int32 AdmissionSessionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCompositeReportByInstitute(UserTypeID, DistrictID, AdmissionSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCompositeReportByInstitute");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCompositeReportByCourse(Int32 UserTypeID, Int64 InstituteID, Int32 AdmissionSessionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCompositeReportByCourse(UserTypeID, InstituteID, AdmissionSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCompositeReportByCourse");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCompositeReportByBatch(Int32 UserTypeID, Int64 InstituteID, Int64 CourseID, Int32 AdmissionSessionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCompositeReportByBatch(UserTypeID, InstituteID, CourseID, AdmissionSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCompositeReportByBatch");
                throw ex;
            }
            return dt;
        }
        public DataTable DistrictWiseMarkSheetCertificateStatistic(Int32 DistrictID, Int32 ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.DistrictWiseMarkSheetCertificateStatistic(DistrictID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DistrictWiseMarkSheetCertificateStatistic");
                throw ex;
            }
            return dt;
        }
        public DataTable GetAttendanceSubjectsByCenterWise(Int64 CenterID, Int32 ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetAttendanceSubjectsByCenterWise(CenterID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAttendanceSubjectsByCenterWise");
                throw ex;
            }
            return dt;
        }
        public DataSet GetSTEPCoordinatorsList() 
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSTEPCoordinatorsList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTEPCoordinatorsList");
                throw ex;
            }
            return ds;
        }
        public DataTable GetGreenFieldReportData(
    Int32 FinancialYearID,
    Int32 RegionID,
    Int32 DistrictID,
    Int32 TalukaID,
    int UserTypeID,
    string UserLoginID)
        {
            DataTable dt = new DataTable();

            try
            {
                dt = objData.GetGreenFieldReportData(
                    FinancialYearID,
                    RegionID,
                    DistrictID,
                    TalukaID,
                    UserTypeID,
                   UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetGreenFieldReportData");

                throw;
            }

            return dt;
        }
        public DataTable GetGazetteReportData(Int32 ExaminationID, char IsResultFresh, Int64 InstituteID, char GazetteType, Int32 DistrictID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetGazetteReportData(ExaminationID, IsResultFresh, InstituteID, GazetteType, DistrictID);
            }
            catch(Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetGazetteReportData");
                throw ex;
            }
            return dt;
        }
    }
}
