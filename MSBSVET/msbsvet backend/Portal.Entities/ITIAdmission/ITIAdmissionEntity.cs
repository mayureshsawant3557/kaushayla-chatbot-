using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITIAdmission
{
    public class ITIAdmissionEntity
    {
        public string RegistrationNumber { get; set; }
        public string CandidateFirstName { get; set; }
        public string CandidateMiddleName { get; set; }
        public string CandidateLastName { get; set; }
        public string Gender { get; set; }
        public string GenderCode { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Nationality { get; set; }
        public string MotherTounge { get; set; }
        public string Religion { get; set; }
        public short ReligionID { get; set; }
        public string Category { get; set; }
        public short CategoryID { get; set; }
        public string CasteName { get; set; }
        public int CasteID { get; set; }
        public string NonCreamyLayer { get; set; }
        public string PrimaryMobileNo { get; set; }
        public string SecondaryMobileNo { get; set; }
        public string Email { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string CountryName { get; set; }
        public string State { get; set; }
        public short StateID { get; set; }
        public string District { get; set; }
        public int DistrictID { get; set; }
        public string Taluka { get; set; }
        public int TalukaID { get; set; }
        public string City { get; set; }
        public int CityID { get; set; }
        public string PinCode { get; set; }
        public int PincodeID { get; set; }
        public string OrphanCandidate { get; set; }
        public string NameOfOrphanage { get; set; }
        public string OrphanageDistrictName { get; set; }
        public string OrphanageStateName { get; set; }
        public string OrphanageTalukaName { get; set; }
        public string FatherName { get; set; }
        public string FatherLastName { get; set; }
        public string MotherName { get; set; }
        public string MotherLastName { get; set; }
        public string IsDisabled { get; set; }
        public string DisabilityPercentage { get; set; }
        public string disabilitycategory { get; set; }
        public string IsTenthPass { get; set; }
        public int TenthTotal { get; set; }
        public int TenthObtained { get; set; }
        public string StreamName { get; set; }
        public string SSCRollOrSeatNumber { get; set; }
        public string SSCYear { get; set; }
        public string SSCMonth { get; set; }
        public string SSCFullName { get; set; }
        public DateTime SSCDateOfBirth { get; set; }
        public string SSCExamResult { get; set; }
        public string ExamBoard { get; set; }

        public string ITIName { get; set; }
        public string DVETInstituteCode { get; set; }
        public string TradeName { get; set; }
        public string TradeCode { get; set; }
        public string AdmissionYear { get; set; }
    }
}
