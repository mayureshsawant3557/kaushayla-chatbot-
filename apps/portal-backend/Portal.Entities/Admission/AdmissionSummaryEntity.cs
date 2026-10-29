
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Admission
{
	public class AdmissionSummaryEntity
	{
		public CandidateApplicationStatusSummaryEntity CandidateApplicationStatusSummary { get; set; }
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
		public AllotmentSummaryEntity AllotmentSummary { get; set; }
		public List<RequiredDocumentSummaryEntity> ListRequiredDocumentSummary { get; set; }
        public CandidateRequiredDetailsValidationEntity CandidateCheckRequiredFields { get; set; }
        public AdmissionSummaryEntity()
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
			AllotmentSummary = new AllotmentSummaryEntity();
			ListRequiredDocumentSummary = new List<RequiredDocumentSummaryEntity>();
            CandidateCheckRequiredFields = new CandidateRequiredDetailsValidationEntity();
        }
	}
	public class AllotmentSummaryEntity
	{
		public Int64 CandidateID { get; set; }
		public Int64 CourseID { get; set; }

		public string Round { get; set; }
		public string MeritNo { get; set; }
		public string MeritMarks { get; set; }
		public string EligibleCategory { get; set; }
		public string EligibleSocialReservation { get; set; }
		public string AllottedChoiceCode { get; set; }
		public string AllottedChoiceCodeDisplay { get; set; }
		public string AllottedCollege { get; set; }
		public string AllottedStream { get; set; }
		public string AllottedStatus { get; set; }
		public string AllottedMedium { get; set; }
		public string AllottedPreferenceNo { get; set; }
		public string AllottedType { get; set; }
		public string AllotmentDate { get; set; }
		public string IsConsentGiven { get; set; }
		public string ConsentGivenDateTime { get; set; }
		public string ConsentGivenBy { get; set; }
		public string ConsentGivenByIPAddress { get; set; }
		public string AdmissionDate { get; set; }
		public string AdmissionComments { get; set; }
		public string ReportingStatus { get; set; }
		public string ReportedDateTime { get; set; }
		public string ReportedBy { get; set; }
		public string ReportedByIPAddress { get; set; }
		public string CancellationComments { get; set; }
		public string CancelledDateTime { get; set; }
		public string CancelledBy { get; set; }
		public string CancelledByIPAddress { get; set; }
		public string RejectionComments { get; set; }
		public string ReasonForRejection { get; set; }
		public string CourseFee { get; set; }
		public string PaidCourseFee { get; set; }
		public string CourseStartDate { get; set; }
		public string RefundFee { get; set; }
		public string RejectedBy { get; set; }
		public string RejectedByIPAddress { get; set; }
		//public string RejectedDateTime { get; set; }

        public Int16 UnitNo { get; set; }
		public Int32 Intake { get; set; }
		public Int32 IntakePerUnit { get; set; }
		public Int16 ShiftNo { get; set; }
	}
    public class CandidateRequiredDetailsValidationEntity
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
