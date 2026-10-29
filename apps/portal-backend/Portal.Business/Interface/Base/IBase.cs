using Portal.Entities;
using Portal.Entities.Base;

//using AjaxControlToolkit;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Base
{
    public interface IBase
    {
        List<DropdownEntity> GetMasterTableList(string TableName, string DataValueField, string DataTextField, bool HasSelect = true, string ParentField = "", string ParentFieldValue = "", string orderByText = "");
        List<DropdownEntity> GetMasterRegion();
        List<DropdownEntity> GetMasterRegionDistrict();
        List<DropdownEntity> GetMasterDistrictTalukas();
        DataTable GetExamType();

        List<DropdownEntity> GetMasterDistrict();
        List<DropdownEntity> GetMasterTaluka();
        List<DropdownEntity> GetMasterCity();
        List<DropdownEntity> GetMasterCaste();
        List<DropdownEntity> GetMasterQualification(long CandidateID, string QualificationGroup);
        List<DropdownEntity> GetMasterSector();
        List<DropdownEntity> GetMasterCourseType();
        List<DropdownEntity> GetMasterCourse(short SectorID, short CourseTypeID, string Flag = "");
        List<DropdownEntity> GetMasterInstitute();
        List<DropdownEntity> GetMasterSectorByITISTT(Int16 ITISTT);

        List<DropdownEntity> GetMasterCourseByITISTT(Int16 SectorID, Int16 CourseTypeID, Int16 ITISTT);
        List<DropdownEntity> GetMasterEntryQualification();

        Int64 GetApprovedInstituteIDByInstituteCode(string InstituteCode);
        DataTable CheckExistingInstituteSDIApplicationExists(Int64 InstituteID);
        void SaveLog(LogEntity entity);
        void SaveMessageContent(MessagingEntity me);
        bool IsNewRegistrationStarted(short UserTypeID);
        string GetOTP(string MobileNo, string Purpose, string OTP);
        void SaveOTPVerificationStatus(string MobileNo, string Purpose, string OTP, bool IsOTPVerified);
        PincodeEntity GetPincodeData(string Pincode);
        bool IsCandidateFormLocked(long CandidateID);
        DataTable GetEMailSMS(string Purpose, string MessageType, string Param1 = "", string Param2 = "", string Param3 = "", string Param4 = "", string Param5 = "");
        short GetCandidateStepID(long CandidateID);
        string GetCandidateMobileNo(long CandidateID);
        long GetCandidateID(string ApplicationID);
        string GetCandidateName(long CandidateID);
        void SaveUserActionDetails(string Module, string UserLoginID, string ApplicationID, string ActionTaken, string IPAddress, string PageURL);
        List<DropdownEntity> GetMasterPromoterType(string Group = "");
        List<DropdownEntity> GetMasterPromoterStatus();
        List<DropdownEntity> GetMasterLocationCategory();
        long GetInstituteIDByInstituteCode(string InstituteCode);
        bool IsPasswordValid(string UserLoginID, string UserPassword);
        bool IsAdmissionConfirmationStarted();
        DataTable GetCurrentAdmissionYear();
        DataTable GetCurrentFinancialYear();
        DataTable GetCurrentAdmissionYearForApplication();

        DataTable GetMasterMainCourse();
        long GetApplicationIDByApplicationIDDisplay(string ApplicationIDDisplay);
        long GetCandidateIDByApplicationID(long ApplicationID);
        string GetApplicationIDDisplayByApplicationID(long ApplicationID);
        string GetCandidateProfileIDByApplicationID(long ApplicationID);
        string GetCandidateProfileIDByCandidateId(long CandidateID);
        DataSet GetHomeDashboard();
        DataSet GetHomeSTTDashboard();

        DataTable GetCourseByCollogeID(long CollegeID, short isnewadmission);
        DataTable GetRegionInstitute(int RegionID);

        int GetDistrictIDByDistrictUser(string UserLoginID);
        DataTable GetAdmissionYear();
        DataTable GetInstiuteInfo(long InstituteID);
        List<DropdownEntity> GetMasterInstituteForExamCerter();
        short GetStaffStepID(long StaffID);
        bool IsStaffFormLocked(long StaffID);
        long GetStaffID(string ApplicationID);
        List<DropdownEntity> GetMasterPromotingType();
        bool ISSectorialExpertiseRequired(long StaffID);
        DataTable GetMasterMainCourseApply();
        DataTable GetExamination();
        DataTable GetExamination(long InstituteID);
        DataTable GetExamination(long? examTypeId, long? yearId);

        DataTable GetTimeTableSubject(int ExaminationID);
        bool IsEvaluationReportDate(string Subjecttype);
        List<DropdownEntity> GetElectiveSubjectes();
        DataTable GetCurrentExamination();

        bool IsEstablishmentFormLocked(long EastablishmentID);
        List<DropdownEntity> GetMasterBTRI();
        List<DropdownEntity> GetMasterBTRI(long EstablishmentID);
        DataTable GetTimeTableCourseWise(long CourseID, int ExaminationID);
        List<OtherInfraEntity> GetMasterOtherInfraDetails();

        DataTable IsEditingAllowed(InstituteInputEntity entity);
        DataTable GetExaminationDetails(int ExamID);
        DataTable GetCourseSearch(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID);
        DataTable GetCourseSearchForAdmission(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID);
        List<DropdownEntity> GetMasterSubSector(short SectorID);
        DataTable GetIsGovCollege(long CollegeID, string UserLoginID);
        DataTable GetIsActivityValid(string ActivityName);



        // Master Mapping

        DataSet GetMappingMasterDetails(int mappingId, int parentId);
        string SetMappingMasterDetails(MappingMasterEntity entity);
        List<DropdownEntity> GetMasterCourseFilter(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID);
        string IsDuplicateCourseCode(string CourseCode);
        string IsDuplicateCourseName(string CourseName);
        List<DropdownEntity> GetMasterTrainingNameofItem();
        DataTable GetCourseType();
        DataTable GetApprovalOrder();
        ApprovalOrderEntity GetApprovalOrderByID(long ID);
        string SaveApprovalOrder(ApprovalOrderEntity entity);
        string DeleteApprovalOrder(long ID, string UserLoginID, string IPAddress);
        List<DropdownEntity> GetMasterInstituteFilter(int RegionID, int DistrictID, int TalukaID, long ExaminationID);
        DataTable IsStaffAadharNoDuplicate(string AadharNo, long StaffID);
        DataTable IsCandidateAadharNoDuplicate(string AadharNo, long CandidateID);



        //SDI
        List<string> GetMasterIgnoreWords();
        List<DropdownEntity> GetMasterSkillInstitute();

        // 
        DataTable GetUserRegionDistrictTaluka(string userLoginID);
        Int64 GetPromotingOrganisationIDByTempInstituteID(Int64 InstituteID);

        List<DropdownEntity> GetSectorwiseCourseTypes(Int32 SectorID);

        Int64 GetPromotingOrganisationIDByInstituteCode(string InstituteCode);
        Int64 GetExistingInstituteID(Int64 InstituteID);

        //stt
        DataTable GetCourseSearchForAdmissionSTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID);
        DataTable GetCoursesForAdmissionITISTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID);

        //newly added for the ExamTimeTable page 
        DataTable GetExamTimetableCourses();

        DataTable GetCourseSearchForExamTimeTable(string courseCode, long examinationId);
        DataTable GetVisitorStatistics();

        //DataTable GetCourseSearchForExamTimeTable(string courseCode);


        DataSet GetSecretaryDashboard();

        DataTable GetInspectionCommitteeByApplicantDate(DateTime applicantDate);

        //get master_course 
        DataTable GetMasterCourseData(int CourseID, string CourseCode,int PageNumber, int PageSize);
       // string SaveMasterCourse(MasterCourseEntity entity);


    }
}

