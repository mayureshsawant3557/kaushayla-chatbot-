using Admission.Business;


using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Base;
using Portal.Entities.Exam;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Admission.Business
{
    public class ExamWorker : IExam
    {
    

        // Repository objData = new Repository();
        private readonly Repository objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public ExamWorker(Repository objData)
        {
            this.objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public ExamWorker()
        {
        }

        public DataSet GetExamCenterMapping(Int64 DistrictID, Int32 ExaminationID)
        {
            DataSet dt = new DataSet();
            try
            {
                dt = objData.GetExamCenterMapping(DistrictID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamCenterMapping");
                throw ex;
            }
            return dt;
        }
        public DataSet GetEvaluationCenterMapping(Int64 DistrictID, Int32 ExaminationID)
        {
            DataSet dt = new DataSet();
            try
            {
                dt = objData.GetEvaluationCenterMapping(DistrictID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEvaluationCenterMapping :" + DistrictID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetExamCenterMappingByCollegeID(Int64 InstituteID, Int32 ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExamCenterMappingByCollegeID(InstituteID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamCenterMappingByCollegeID :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public string SaveExamCenters(string xmldoc)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveExamCenters(xmldoc);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExamCenters", "");
                retVal = ex.Message;
            }
            return retVal;
        }


        public DataTable GetEvaluationCenterMappingByCollegeID(Int64 InstituteID, Int32 ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetEvaluationCenterMappingByCollegeID(InstituteID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEvaluationCenterMappingByCollegeID :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetCertificateList(long instituteId, long courseId)
        {
            DataTable dt = new DataTable();

            try
            {
                dt = objData.GetCertificateList(instituteId, courseId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetCertificateList InstituteID:" + instituteId +
                    " CourseID:" + courseId);

                throw ex;
            }

            return dt;
        }
        public string SaveEvaluationCenters(string xmldoc)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveEvaluationCenters(xmldoc);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveEvaluationCenters", "");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetBatchesForAssessment(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForAssessment(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForAssessment :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidatebyBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidatebyBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidatebyBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataTable GetBatchesForExamFees(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForExamFees(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForExamFees :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateForExamFeesByBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForExamFeesByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForExamFeesByBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataTable GetBatchesForHallTicket(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForHallTicket(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForHallTicket :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateForHallTicketByBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForHallTicketByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForHallTicketByBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetHallTicket(Int64 ApplicationID, Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetHallTicket(ApplicationID, BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetHallTicket : ApplicationID: " + ApplicationID.ToString() + " BatchID: " + BatchID.ToString());
                throw ex;
            }
            return ds;

        }

        public DataTable GetBatchesForAttendance(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForAttendance(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForAttendance :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateForAttendanceByBatchID(Int64 BatchID, string SubjectType)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForAttendanceByBatchID(BatchID, SubjectType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForAttendanceByBatchID :" + BatchID.ToString() + " "+ SubjectType);
                throw ex;
            }
            return ds;

        }
        public DataSet GetAttendance(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetAttendance(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAttendance :  BatchID: " + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetAttendanceSubjects(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetAttendanceSubjects(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAttendanceSubjects :  BatchID: " + BatchID.ToString());
                throw ex;
            }
            return ds;

        }

        public DataTable GetBatchesForEvaluationReport(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForEvaluationReport(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForEvaluationReport :" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateForEvaluationReportByBatchID(Int64 BatchID, string ExamSubjectType)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForEvaluationReportByBatchID(BatchID, ExamSubjectType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForAttendanceByBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetCandidateForEvaluationReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForEvaluationReportByBatchIDDownload(BatchID, ExamSubjectType, SubjectCode, ElectiveSubjectID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForEvaluationReportByBatchIDDownload :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetCandidateForEvaluationMArksByBatchID(Int64 BatchID, string ExamSubjectType, string SubjectCode, int EvalutionSubjectID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForEvaluationMArksByBatchID(BatchID, ExamSubjectType, SubjectCode, EvalutionSubjectID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForEvaluationMArksByBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetCandidateForEvaluationBlankReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForEvaluationBlankReportByBatchIDDownload(BatchID, ExamSubjectType, SubjectCode, ElectiveSubjectID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForEvaluationBlankReportByBatchIDDownload :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public string SaveMarks(ExamMarksEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveMarks(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExamCenters", "");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataSet GetCandidateForEvaluationMarksReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int EvalutionSubjectID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForEvaluationMarksReportByBatchIDDownload(BatchID, ExamSubjectType, SubjectCode, EvalutionSubjectID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForEvaluationMarksReportByBatchIDDownload :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet GetResultStatus(Int32 UserTypeID, Int32 ExamTypeID, Int32 ExaminationID, Int32 MarksSubmissionStatus, Int64 InstituteID, Int64 EvaluationCenterID, Int64 CourseID, string SubjectCode, Int32 SubjectTypeID, string UserLoginID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetResultStatus(UserTypeID, ExamTypeID, ExaminationID, MarksSubmissionStatus, InstituteID, EvaluationCenterID, CourseID, SubjectCode, SubjectTypeID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultStatus UserTypeID:" + UserTypeID.ToString() + " ExamTypeID :" + ExamTypeID.ToString() + " ExaminationID : " + ExaminationID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataSet GetResultStatusByBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetResultStatusByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForAttendanceByBatchID :" + BatchID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataTable CandidateResultCertificate(Int64 CandidateID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.CandidateResultCertificate(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CandidateResultCertificate :" + CandidateID.ToString());
                throw ex;
            }
            return dt;

        }
        public DataSet CandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.CandidatePrintResultCertificate(CandidateID, ApplicationID, ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CandidateResultCertificate :" + CandidateID.ToString() + " ApplicationID" + ApplicationID.ToString() + "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataSet CandidatePrintResultCertificate(Int64 BranchID, Int32 ExaminationID, string IsResultFresh)
        {
            DataSet ds = new DataSet();
            try
            {
                //ds = objData.CandidatePrintResultCertificate(CandidateID, ApplicationID, ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CandidateResultCertificate : BranchID" + BranchID.ToString(), "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;

        }
        public DataTable GetCandidatePrintBulkResultCertificate()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidatePrintBulkResultCertificate();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidatePrintBulkResultCertificate ");
                throw ex;
            }
            return dt;

        }
        public DataTable GetCandidatePrintBulkSubject(Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidatePrintBulkSubject(ApplicationID, ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidatePrintBulkSubject ");
                throw ex;
            }
            return dt;

        }
        public DataTable GetResultBatchWise(Int32 ExaminationID, Int32 ExamTypeID, Int32 UserTypeID, Int64 InstituteID, Int64 CourseID, Int32 DistrictID, string UserLoginID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetResultBatchWise(ExaminationID, ExamTypeID, UserTypeID, InstituteID, CourseID, DistrictID, UserLoginID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultBatchWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable BatchPrintResultCertificate(Int32 ExaminationID, Int64 BatchID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.BatchPrintResultCertificate(ExaminationID, BatchID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "BatchPrintResultCertificate " + BatchID + " ExaminationID: " + ExaminationID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetResultInstituteWise(Int32 ExaminationID, Int32 ExamTypeID, Int32 UserTypeID, Int64 InstituteID, Int32 DistrictID, string UserLoginID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetResultInstituteWise(ExaminationID, ExamTypeID, UserTypeID, InstituteID, DistrictID, UserLoginID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultInstituteWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable GetResultExamWise(Int32 ExaminationID, Int32 ExamTypeID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetResultExamWise(ExaminationID, ExamTypeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultExamWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable InstitutePrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.InstitutePrintResultCertificate(ExaminationID, InstituteID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultBatchWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable PrintResultCertificateBulk(Int32 ExaminationID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.PrintResultCertificateBulk(ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PrintResultCertificateBulk ");
                throw ex;
            }
            return dt;
        }
        public DataTable InstituteBulkPrintResult(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.InstituteBulkPrintResult(ExaminationID, InstituteID, IsResultFresh, ResCertificate);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultBatchWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable InstituteBulkPrintResult21Century(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.InstituteBulkPrintResult21Century(ExaminationID, InstituteID, IsResultFresh, ResCertificate);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultBatchWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable InstituteBulkPrintResultLong(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.InstituteBulkPrintResultLong(ExaminationID, InstituteID, IsResultFresh, ResCertificate);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultBatchWise ");
                throw ex;
            }
            return dt;
        }
        public DataTable GetBatchesForElectiveSubjectAssing(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForElectiveSubjectAssing(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForElectiveSubjectAssing ");
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateForElectiveAssignByBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCandidateForElectiveAssignByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateForElectiveAssignByBatchID ");
                throw ex;
            }
            return ds;
        }

        public string SaveElectiveSubjects(string xmldoc, string ReportedBy, string ReportedByIPAddress, Int64 BatchID)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveElectiveSubjects(xmldoc, ReportedBy, ReportedByIPAddress, BatchID);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveElectiveSubjects", BatchID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        //public string MarkCertificatePrinted(long certificateId)
        //{
        //    return objData.MarkCertificatePrinted(certificateId);
        //}
        public string MarkCertificatePrinted(
    long certificateId,
    string printedBy,
    string printedIpAddress)
        {
            return objData.MarkCertificatePrinted(
                certificateId,
                printedBy,
                printedIpAddress);
      }
        public DataSet GetEvaluationCenterMappingAll(Int32 ExamType, Int64 InstituteID, Int64 DistrictID, Int32 ExaminationID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetEvaluationCenterMappingAll(ExamType, InstituteID, DistrictID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEvaluationCenterMappingAll ");
                throw ex;
            }
            return ds;
        }
        public List<DropdownEntity> GetEvolutionCenterExamination()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetEvolutionCenterExamination();
                objList = CommonHelper.DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterRegion");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetExamCenterExamination()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetExamCenterExamination();
                objList = CommonHelper.DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterRegion");
                throw ex;
            }
            return objList;
        }

        #region
        public DataTable GetCandidateResults(Int64 CandidateID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidateResults(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateResults : " + CandidateID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetCandidateResultsDetails(Int64 ApplicationID, Int64 CourseID, Int32 ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidateResultsDetails(ApplicationID, CourseID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateResultsDetails : " + ApplicationID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataSet GetCandidateResultsDetailsForApprove(Int64 ApplicationID, Int32 ExaminationID)
        {
            DataSet dt = new DataSet();
            try
            {
                dt = objData.GetCandidateResultsDetailsForApprove(ApplicationID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateResultsDetailsForApprove : " + ApplicationID.ToString());
                throw ex;
            }
            return dt;
        }
        public string SaveResultCorrection(string XMLString, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveResultCorrection(XMLString, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveResultCorrection", UserLoginID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable GetCandidateListForApprove()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCandidateListForApprove();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateListForApprove : ");
                throw ex;
            }
            return dt;
        }
        public string UpdateCandidateResult(Int64 ApplicationID, Int32 ExaminationID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateCandidateResult(ApplicationID, ExaminationID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateCandidateResult", ApplicationID.ToString());
                retVal = ex.Message;
            }
            return retVal;

        }
        public string UpdateCandidateResultReject(Int64 ApplicationID, Int32 ExaminationID, string UserLoginID, string IPAddress, string RejectRemark)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateCandidateResultReject(ApplicationID, ExaminationID, UserLoginID, IPAddress, RejectRemark);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateCandidateResultReject", ApplicationID.ToString() + " " + RejectRemark);
                retVal = ex.Message;
            }
            return retVal;

        }
        public DataTable GetApprovedResultCandidateList()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetApprovedResultCandidateList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovedResultCandidateList : ");
                throw ex;
            }
            return dt;
        }
        public DataTable GetApprovedResultCandidateList(Int32 ExaminationID, Int32 ExamTypeID, Int64 InstituteID, string UserLoginID, Int32 DistrictID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetApprovedResultCandidateList( ExaminationID,  ExamTypeID, InstituteID,  UserLoginID,  DistrictID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovedResultCandidateList : ");
                throw ex;
            }
            return dt;
        }
        public DataTable CandidatePrintResultCertificate(Int32 ExaminationID, Int64 ApplicationID, string IsResultFresh)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.CandidatePrintResultCertificate(ExaminationID, ApplicationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CandidatePrintResultCertificate ");
                throw ex;
            }
            return dt;
        }
        public DataTable CandidatePrintResult(Int32 ExaminationID, Int64 ApplicationID, string IsResultFresh, char ResCertificate)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.CandidatePrintResult(ExaminationID, ApplicationID, IsResultFresh, ResCertificate);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CandidatePrintResult " + ApplicationID.ToString());
                throw ex;
            }
            return dt;
        }
        #endregion
        public DataTable AcadmisthanPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.AcadmisthanPrintResultCertificate(ExaminationID, InstituteID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "AcadmisthanPrintResultCertificate :" + InstituteID.ToString() + " ApplicationID" + InstituteID.ToString() + "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataSet AcadmisthanCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.AcadmisthanCandidatePrintResultCertificate(CandidateID, ApplicationID, ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "AcadmisthanCandidatePrintResultCertificate :" + CandidateID.ToString() + " ApplicationID" + ApplicationID.ToString() + "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataTable AcadmisthanCandidatePrintResultCertificateByCandidateID(Int64 CandidateID)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.AcadmisthanCandidatePrintResultCertificateByCandidateID(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "AcadmisthanCandidatePrintResultCertificateByCandidateID :" + " CandidateID " + CandidateID.ToString());
                throw ex;
            }
            return ds;
        }

        public DataTable AcademisthanCertificate_GetForPrinting()
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.AcademisthanCertificate_GetForPrinting();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "AcademisthanCertificate_GetForPrinting.");
                throw ex;
            }
            return ds;
        }

        public string MarkCertificateAsPrinted(Int32 ID, Int64 CandidateID, Int64 ApplicationID)
        {
            string retVal = "";
            try
            {
                retVal = objData.MarkCertificateAsPrinted(ID, CandidateID, ApplicationID);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "MarkCertificateAsPrinted :" + ID.ToString() + " CandidateID " + CandidateID.ToString() + " ApplicationID " + ApplicationID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        //BCLS------
        public DataTable BCLSPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.BCLSPrintResultCertificate(ExaminationID, InstituteID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "BCLSPrintResultCertificate :" + InstituteID.ToString() + " ApplicationID" + InstituteID.ToString() + "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;
        }

        public DataSet BCLSCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.BCLSCandidatePrintResultCertificate(CandidateID, ApplicationID, ExaminationID, IsResultFresh);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "BCLSCandidatePrintResultCertificate :" + CandidateID.ToString() + " ApplicationID" + ApplicationID.ToString() + "ExaminationID " + ExaminationID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataTable BCLSCandidatePrintResultCertificateByCandidateID(Int64 CandidateID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.BCLSCandidatePrintResultCertificateByCandidateID(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "BCLSCandidatePrintResultCertificateByCandidateID :" + " CandidateID " + CandidateID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetBCLSPendingCandidates(Int64 InstituteID)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetBCLSPendingCandidates( InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBCLSPendingCandidates ");
                throw ex;
            }
            return ds;
        }

        public string UpdateSingleCandidateResultDate(Int64 CandidateID, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateSingleCandidateResultDate(CandidateID, ApplicationID, CourseCompletionDate, CreatedBy, CreatedIpAddress);
                if (retVal == "1")
                {
                    retVal = "Success";
                }
                else
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateSingleCandidateResultDate :" + CandidateID.ToString() + " ApplicationID " + ApplicationID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public int UpdateMultipleCandidateResultDate(string CandidateIDs, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress)
        {
            try
            {
                int count = objData.UpdateMultipleCandidateResultDate(CandidateIDs, ApplicationID, CourseCompletionDate, CreatedBy, CreatedIpAddress);

                return count;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message,"UpdateMultipleCandidatesResultDate", CandidateIDs.ToString());
                throw;
            }
        }



        public DataTable GetBatchesForElectiveSubjectAssingForPreviousCandiates(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchesForElectiveSubjectAssingForPreviousCandiates(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchesForElectiveSubjectAssingForPreviousCandiates", InstituteID.ToString());
                throw ex;
            }
            return dt;
        }

        public DataSet GetBacklogCandidateForElectiveAssignByBatchID(Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetBacklogCandidateForElectiveAssignByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBacklogCandidateForElectiveAssignByBatchID", BatchID.ToString());
                throw ex;
            }
            return ds;
        }

        //newly added for the Examination page 
        public DataTable GetExaminationDuration()
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetExaminationDuration();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationDuration");
                throw ex;
            }
            return ds;
        }

        public DataTable GetExaminationCoursesByDuration(string fullDuration)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetExaminationCoursesByDuration(fullDuration);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationCoursesByDuration");
                throw ex;
            }
            return ds;
        }

        public DataTable GetCourseSearchForExamination(string courseCode)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetCourseSearchForExamination(courseCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearchForExamination");
                throw ex;
            }
            return ds;
        }

        public DataTable GetExaminationSubjectType()
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetExaminationSubjectType();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationSubjectType");
                throw ex;
            }
            return ds;
        }

        public DataTable GetExaminationByCourseAndSubjectType(string courseCodes, int? subjectTypeId)
        {
            try
            {
                return objData.GetExaminationByCourseAndSubjectType(courseCodes, subjectTypeId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationByCourseAndSubjectType");
                throw;
            }
        }

        public DataTable GetExaminationSubjects(string courseCode, string subjectTypeId = null)
        {
            try
            {
                return objData.GetExaminationSubjects(courseCode, subjectTypeId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationSubjects");
                throw;
            }
        }

        //public DataTable GetExaminationSubjects(int examinationId, string courseCode, string subjectTypeId)
        //{
        //    try
        //    {
        //        return objData.GetExaminationSubjects(examinationId, courseCode, subjectTypeId);
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetExaminationSubjects");
        //        throw;
        //    }
        //}
        public string SaveExaminationTimeTable(List<ExamTimeTableEntity> entities)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveExaminationTimeTable(entities);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveExaminationTimeTable", "");
                retVal = ex.Message;
            }
            return retVal;
        }



        public DataTable GetExaminationsByYear(int yearId, int examTypeId)
        {
            try
            {
                return objData.GetExaminationsByYear(yearId, examTypeId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationsByYear");
                throw; // Note: 'throw' is cleaner than 'throw ex' to preserve stack trace
            }
        }

        public DataTable GetSavedExaminationTimeTable(long examinationId, long? examinationYearId, string courseCodes, string subjectCodes)
        {
            try
            {
                return objData.GetSavedExaminationTimeTable(examinationId, examinationYearId, courseCodes, subjectCodes);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSavedExaminationTimeTable");
                throw;
            }
        }

        public string SaveSubjectCourseMarks(List<SubjectCourseMarksEntity> entities)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveSubjectCourseMarks(entities);

                // SP returns descriptive Status text, not a "Y"/"N" flag —
                // "Updated" is the only success case
                if (!string.Equals(retVal, "Updated", StringComparison.OrdinalIgnoreCase))
                {
                    retVal = string.IsNullOrWhiteSpace(retVal)
                        ? "Data has not been saved. Please try again."
                        : retVal;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSubjectCourseMarks", "");
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable GetSubjectMarksByCourseId(int courseId)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetSubjectMarksByCourseId(courseId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSubjectMarksByCourseId");
                throw ex;
            }
            return ds;
        }

        public string UploadExaminationTimeTable(List<ExamTimeTableUploadEntity> entities, string userLoginID, string ipAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UploadExaminationTimeTable(entities, userLoginID, ipAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UploadExaminationTimeTable", "");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataSet GetExaminationRemainedToPublishResult(int examTypeID, int examYearID, long examinationID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetExaminationRemainedToPublishResult(examTypeID, examYearID, examinationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExaminationRemainedToPublishResult");
                throw ex;
            }
            return ds;

        }

        public string PublishExamsResult(Int32 examTypeID, Int32 examYearID, Int64 examinationID, string resultDate, string userLoginID, string ipAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.PublishExamsResult(examTypeID, examYearID, examinationID, resultDate, userLoginID, ipAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PublishExamsResult", "");
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveMasterExamination(MasterExaminationEntity entity)
        {
            string retVal = "";

            try
            {
                retVal = objData.SaveMasterExamination(entity);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "SaveMasterExamination",
                    ""
                );

                retVal = ex.Message;
            }

            return retVal;
        }
    }
 }

