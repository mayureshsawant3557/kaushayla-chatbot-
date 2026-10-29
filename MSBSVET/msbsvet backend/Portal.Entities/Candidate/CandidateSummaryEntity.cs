using Microsoft.SqlServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class CandidateSummaryEntity
    {
        public CandidateApplicationStatusSummaryEntity CandidateApplicationStatusSummary { get; set; }
        public CandidateCheckRequiredFieldsEntity CandidateCheckRequiredFields { get; set; }
        public CandidatePrimarySummaryEntity CandidatePrimarySummary { get; set; }
        public CandidateAddressSummaryEntity CandidateAddressSummary { get; set; }
        public CandidateParentSummaryEntity CandidateParentSummary { get; set; }
        public CandidateCategorySummaryEntity CandidateCategorySummary { get; set; }
        public List<CandidateQualificationSummaryEntity> CandidateQualificationSummaryList { get; set; }
        public List<CandidateTrainingSummaryEntity> CandidateTrainingSummaryList { get; set; }
        public CandidateAdditionalSummaryEntity CandidateAdditionalSummary { get; set; }
        public List<CandidateLanguageSummaryEntity> CandidateLanguageSummaryList { get; set; }
        public CandidateBankSummaryEntity CandidateBankSummary { get; set; }
        public List<CandidateWorkExperienceSummaryEntity> CandidateWorkExperienceSummaryList { get; set; }
        public CandidateSummaryEntity()
        {
            CandidateApplicationStatusSummary = new CandidateApplicationStatusSummaryEntity();
            CandidatePrimarySummary = new CandidatePrimarySummaryEntity();
            CandidateAddressSummary = new CandidateAddressSummaryEntity();
            CandidateParentSummary = new CandidateParentSummaryEntity();
            CandidateCategorySummary = new CandidateCategorySummaryEntity();
            CandidateQualificationSummaryList = new List<CandidateQualificationSummaryEntity>();
            CandidateTrainingSummaryList = new List<CandidateTrainingSummaryEntity>();
            CandidateAdditionalSummary = new CandidateAdditionalSummaryEntity();
            CandidateLanguageSummaryList = new List<CandidateLanguageSummaryEntity>();
            CandidateBankSummary = new CandidateBankSummaryEntity();
            CandidateWorkExperienceSummaryList = new List<CandidateWorkExperienceSummaryEntity>();
            CandidateCheckRequiredFields = new CandidateCheckRequiredFieldsEntity();
        }
    }
    public class CandidateApplicationStatusSummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public bool IsPrimaryDetailsFilled { get; set; }
        public bool IsAddressDetailsFilled { get; set; }
        public bool IsParentDetailsFilled { get; set; }
        public bool IsCategoryDetailsFilled { get; set; }
        public bool IsQualificationDetailsFilled { get; set; }
        public bool IsTrainingDetailsFilled { get; set; }
        public bool IsAdditionalDetailsFilled { get; set; }
        public bool IsBankDetailsFilled { get; set; }
        public bool IsWorkExperienceDetailsFilled { get; set; }
        public bool IsEligible { get; set; }
        public string ErrorMsg { get; set; }
        public string WarningMsg { get; set; }
        public Int32 VersionNo { get; set; }
        public Int16 StepID { get; set; }
        public string FormStatus { get; set; }
        public DateTime LastModifiedOn { get; set; }
        public string LastModifiedBy { get; set; }
        public string LastModifiedByIPAddress { get; set; }
        public string LastModifiedPage { get; set; }
        public DateTime ConfirmedDateTime { get; set; }
        public string ConfirmedBy { get; set; }
        public string ConfirmedByIPAddress { get; set; }
    }
    public class CandidatePrimarySummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string ApplicationID { get; set; }
        public string ProfileID { get; set; }
		public string ITIRegistrationNo { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PhotoFilePath { get; set; }
        public string SignFilePath { get; set; }
        public string Gender { get; set; }
        public string DOB { get; set; }
        public string DOBFilePath { get; set; }
        public string AadhaarNo { get; set; }
        public string AadhaarFilePath { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }
    }
    public class CandidateAddressSummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string PAddress { get; set; }
        public string PState { get; set; }
        public string PDistrict { get; set; }
        public string PTaluka { get; set; }
        public string PCity { get; set; }
        public string PPincode { get; set; }
        public string IsCAddressSameAsPAddress { get; set; }
        public string CAddress { get; set; }
        public string CState { get; set; }
        public string CDistrict { get; set; }
        public string CTaluka { get; set; }
        public string CCity { get; set; }
        public string CPincode { get; set; }
    }
    public class CandidateParentSummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string IsOrphan { get; set; }

        public string FatherTitle { get; set; }
        public string MotherTitle { get; set; }
        public string FatherFirstName { get; set; }
        public string FatherMiddleName { get; set; }
        public string FatherLastName { get; set; }
        public string MotherFirstName { get; set; }
        public string MotherMiddleName { get; set; }
        public string MotherLastName { get; set; }
        public string MaritalStatus { get; set; }
        public string SpouseTitle { get; set; }
        public string SpouseFirstName { get; set; }
        public string SpouseMiddleName { get; set; }
        public string SpouseLastName { get; set; }
    }
    public class CandidateCategorySummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string Nationality { get; set; }
        public string IsMHDomiciled { get; set; }
        public string Religion { get; set; }
        public Int16 CategoryID { get; set; }
        public string Category { get; set; }
        public string Caste { get; set; }
        public string CasteCertificatePath { get; set; }
        public string IsBelongToNCL { get; set; }
        public string NCLCertificatePath { get; set; }
        public string IsBelongToPWD { get; set; }
        public Int16 DisabilityPercentage { get; set; }
        public string Disability { get; set; }
        public string DisabilityType { get; set; }
        public string UniqueDisabilityIDNo { get; set; }
        public string PWDCertificatePath { get; set; }
    }
    public class CandidateQualificationSummaryEntity
    {
        public Int64 QualificationRowID { get; set; }
        public Int64 CandidateID { get; set; }
        public string Qualification { get; set; }
        public string QualificationGroup { get; set; }
        public string Degree { get; set; }
        public string Subject { get; set; }
        public string University { get; set; }
        public string ResultDate { get; set; }
        public string AppearingYear { get; set; }
        public Int16 Attempts { get; set; }
        public string MarksObtained { get; set; }
        public string MaximumMarks { get; set; }
        public Int16 CourseDuration { get; set; }
        public string Class { get; set; }
        public string Mode { get; set; }
        public string CertificatePath { get; set; }
    }
    public class CandidateTrainingSummaryEntity
    {
        public Int64 TrainingRowID { get; set; }
        public Int64 CandidateID { get; set; }
        public string Course { get; set; }
        public string CourseConductedBy { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CertificatePath { get; set; }
    }
    public class CandidateAdditionalSummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string BloodGroup { get; set; }
        public string MotherTongue { get; set; }
    }
    public class CandidateLanguageSummaryEntity
    {
        public Int64 LanguageRowID { get; set; }
        public Int64 CandidateID { get; set; }
        public string Language { get; set; }
        public string Read { get; set; }
        public string Write { get; set; }
        public string Speak { get; set; }
    }
    public class CandidateBankSummaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string AccountType { get; set; }
        public string AccountNo { get; set; }
        public string AccountHolderName { get; set; }
        public string IFSCCode { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string PANNo { get; set; }
        public string PANPath { get; set; }
    }
    public class CandidateWorkExperienceSummaryEntity
    {
        public Int64 WorkExperienceRowID { get; set; }
        public Int64 CandidateID { get; set; }
        public string EstablishmentName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public Int32 SalaryPerMonth { get; set; }
        public string JobRole { get; set; }
        public string Address { get; set; }
        public string State { get; set; }
        public string District { get; set; }
        public string Taluka { get; set; }
        public string City { get; set; }
        public string Pincode { get; set; }
    }
    public class RequiredDocumentSummaryEntity
        {
		public Int64 ID { get; set; }
		public Int64 CandidateID { get; set; }
		public Int16 DocumentID { get; set; }
		public string DocumentName { get; set; }
        public bool IsDocumentCompulsory { get; set; }

		public string DocumentUrl { get; set; }
		public Int64 TrainingRowID { get; set; }
		public Int64 QualificationRowID { get; set; }
		public string InstituteVerificationStatus { get; set; }
        public string IsOrignalSubmittedDisplay { get; set; }
        public string DirectorVerificationStatusDisplay { get; set; }
        public string InstituteVerificationStatusDisplay { get; set; }
        public string IsOrignalSubmittedReturnDisplay { get; set; }
		public string IsOrignalDocumentSubmitted { get; set; }
		public string InstituteDateTime { get; set; }
		public string InstituteCreatedBy { get; set; }
		public string DirectorVerificationStatus { get; set; }
		public string DirectorDateTime { get; set; }
		public string DirectorCreatedBy { get; set; }
        public string DocumentVerificationStatus { get; set; }

        public string DocumentVerificationDate { get; set; }
        public string Course { get; set; }
        public string Degree { get; set; }
		public string IsOrignalSubmittedReturn { get; set; }
        public string ReturnDateTime { get; set; }
        public string ReturnBy { get; set; }

	}

    public class CandidateCheckRequiredFieldsEntity
    {
        public Int64 CandidateID { get; set; }

        public Int16 IsFirstNameFilled { get; set; }
        public Int16 IsDOBFilled { get; set; }
        public Int16 IsAadhaarNoFilled { get; set; }
        public Int16 IsProfilePhotoUploaded { get; set; }
        public Int16 IsSignaturePhotoUploaded { get; set; }
        public Int16 IsAadhaarCardUploaded { get; set; }
        public Int16 IsPrimaryNoFilled { get; set; }

        public Int16 IsPAddressFilled { get; set; }
        public Int16 IsCAddressFilled { get; set; }

        public Int16 IsOrphanSelected { get; set; }
        public Int16 IsFatherFirstNameFilled { get; set; }
        public Int16 IsMotherFirstNameFilled { get; set; }

        //public Int16 IsLeavingCertificateUploaded { get; set; }
        public Int16 IsPWDSelected { get; set; }
        public Int16 IsDisabilityCertificateUploaded { get; set; }

        public Int16 IsQualificationDetailsFilled { get; set; }

        public Int16 IsBloodGroupSelected { get; set; }
        public Int16 IsMotherToungeSelected { get; set; }
        public Int16 IsLanguagesKnownSelected { get; set; }

        public bool IsEligible { get; set; }

        public string ErrorMsg { get; set; }
        public string WarningMsg { get; set; }
    }
}
