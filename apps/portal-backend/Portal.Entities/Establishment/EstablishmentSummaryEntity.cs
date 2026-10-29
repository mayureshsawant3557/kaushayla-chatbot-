using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentSummaryEntity
    {
        public EstablishmentStatusSummaryEntity EstablishmentStatusSummary { get; set; }
        public EstablishmentProfileSummaryEntity EstablishmentProfileSummary { get; set; }
        public EstablishmentAuthorizedRepresentativeSummaryEntity EstablishmentAuthorizedRepresentativeSummary { get; set; }
        public EstablishmentAddressSummaryEntity EstablishmentAddressSummary { get; set; }
        public EstablishmentBankSummaryEntity EstablishmentBankSummary { get; set; }
        public EstablishmentRegistrationSummaryEntity EstablishmentRegistrationSummary { get; set; }
        public EstablishmentEmployeeSummaryEntity EstablishmentEmployeeSummary { get; set; }
        public EstablishmentSelfDeclarationSummaryEntity EstablishmentSelfDeclarationSummary { get; set; }
        public EstablishmentRequestForInspectionSummaryEntity EstablishmentRequestForInspectionSummary { get; set; }
        public EstablishmentSummaryEntity()
        {
            EstablishmentStatusSummary = new EstablishmentStatusSummaryEntity();
            EstablishmentProfileSummary = new EstablishmentProfileSummaryEntity();
            EstablishmentAuthorizedRepresentativeSummary = new EstablishmentAuthorizedRepresentativeSummaryEntity();
            EstablishmentAddressSummary = new EstablishmentAddressSummaryEntity();            
            EstablishmentBankSummary = new EstablishmentBankSummaryEntity();
            EstablishmentRegistrationSummary = new EstablishmentRegistrationSummaryEntity();
            EstablishmentEmployeeSummary = new EstablishmentEmployeeSummaryEntity();
            EstablishmentSelfDeclarationSummary = new EstablishmentSelfDeclarationSummaryEntity();
            EstablishmentRequestForInspectionSummary = new EstablishmentRequestForInspectionSummaryEntity();
        }
    }
    public class EstablishmentStatusSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public bool IsProfileDetailsFilled { get; set; }
        public bool IsAuthorizedRepresentativeDetailsFilled { get; set; }
        public bool IsAddressDetailsFilled { get; set; }
        public bool IsBankDetailsFilled { get; set; }
        public bool IsRegistrationDetailsFilled { get; set; }
        public bool IsEmployeeDetailsFilled { get; set; }
        public bool IsSelfDeclarationDetailsFilled { get; set; }
        public bool IsRequestForInspectionDetailsFilled { get; set; }
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
    public class EstablishmentProfileSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string ApplicationID { get; set; }
        public string NAPSRegistrationID { get; set; }
        public string NAPSEstablishmentName { get; set; }
        public string EstablishmentType { get; set; }
        public string RegistrationNo { get; set; }
        public string RegistrationDate { get; set; }
        public string EstablishmentName { get; set; }
        public string RegistrationCertificatePath { get; set; }
        public string OperationsSector { get; set; }
    }
    public class EstablishmentAuthorizedRepresentativeSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string Title { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }

        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Designation { get; set; }
        public string Gender { get; set; }
        public string MobileNo { get; set; }
        public string AlternateMobileNo { get; set; }
        public string EMailID { get; set; }
    }
    public class EstablishmentAddressSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string State { get; set; }
        public string District { get; set; }
        public string Taluka { get; set; }
        public string City { get; set; }
        public string Pincode { get; set; }
        public string PhoneNo { get; set; }
        public string EMailID { get; set; }
        public string GoogleMapLocation { get; set; }
    }
    public class EstablishmentBankSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string AccountType { get; set; }
        public string IFSCCode { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string AccountNo { get; set; }
        public string CancelChequePath { get; set; }
    }
    public class EstablishmentRegistrationSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string TAN { get; set; }
        public string TIN { get; set; }
        public string GST { get; set; }
        public string UdyogAadhaar { get; set; }
    }
    public class EstablishmentEmployeeSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string PermanentEmployees { get; set; }
        public string TemporaryEmployees { get; set; }
        public string TotalEmployees { get; set; }
        public string EmployeesHiredFromOtherAgencies { get; set; }
        public string MinimumEligibleApprentices { get; set; }
        public string MaximumEligibleApprentices { get; set; }
    }
    public class EstablishmentSelfDeclarationSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string IsSelfDeclared { get; set; }
    }
    public class EstablishmentRequestForInspectionSummaryEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string BTRIName { get; set; }
        public string InspectionFromDate { get; set; }
        public string InspectionToDate { get; set; }
    }
}
