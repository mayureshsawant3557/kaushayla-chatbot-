using iTextSharp.text.pdf;
using Portal.Entities;
using Portal.Entities.ReportGenerator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Report
{
    public interface IReport
    {
        DataSet GetReportsList();
        DataSet GenerateReport(int ReportID, int UserTypeID);
        DataSet GetCandidateList(long CourseID, long CollegeID, int AdmissionYearID, string Flag, int RegionID);
        DataSet GetITIPrincipalDetails(int ManagementType, string InstType1, string InstType2);
        DataSet GetManagementTypes();
        DataTable GetCompositReport(int UserTypeID, string UserLoginID, int AdmissionSessionID);
        DataTable GetCompositReportByDistrict(int UserTypeID, int RegionID, int AdmissionSessionID);
        DataTable GetCompositeReportByInstitute(int UserTypeID, long DistrictID, int AdmissionSessionID);
        DataTable GetCompositeReportByCourse(int UserTypeID, long InstituteID, int AdmissionSessionID);
        DataTable GetCompositeReportByBatch(int UserTypeID, long InstituteID, long CourseID, int AdmissionSessionID);
        DataTable DistrictWiseMarkSheetCertificateStatistic(int DistrictID, int ExaminationID);
        DataTable GetAttendanceSubjectsByCenterWise(long CenterID, int ExaminationID);
        DataSet GetSTEPCoordinatorsList();
        DataTable GetGreenFieldReportData(int FinancialYearID, int RegionID, int DistrictID, int TalukaID,int UserTypeID , string UserLoginID);
        DataTable GetGazetteReportData(int ExaminationID, char IsResultFresh, long InstituteID, char GazetteType, int DistrictID);
    }
}
