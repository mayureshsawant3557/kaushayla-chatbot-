using System;
using System.Collections.Generic;

namespace Portal.Entities.Registration
{
    public class RegisterComplaintEntity
    {
        public Int16 IsMSBSVETPortal { get; set; }
        public string MSBSVETRegistrationNumber { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }

        public string Address { get; set; }
        public string Pincode { get; set; }
        public Int32 StateID { get; set; }
        public string State  { get; set; }
        public Int32 DistrictID { get; set; }
        public string District  { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka  { get; set; }

        public Int32 CityID { get; set; }

        public string CityName { get; set; }

        public string NameofInstitute { get; set; }
        public int TypeofInstituteID { get; set; }
        public string TypeofInstituteName { get; set; }

        public string NameofPersonwhoownsInstituteFirstName { get; set; }
        public string NameofPersonwhoownsInstituteMiddleName { get; set; }
        public string NameofPersonwhoownsInstituteLastName { get; set; }
        public string NameofPersonwhoownsInstituteMobileNo { get; set; }
        public string NameofPersonwhoownsInstituteWebSite { get; set; }
        public string NameofPersonwhoownsInstituteEMailID { get; set; }

        public string NameofPersonwhoownsInstituteAddress { get; set; }
        public string NameofPersonwhoownsInstitutePincode { get; set; }
        public Int32 NameofPersonwhoownsInstituteStateID { get; set; }
        public Int32 NameofPersonwhoownsInstituteDistrictID { get; set; }
        public Int32 NameofPersonwhoownsInstituteTalukaID { get; set; }

        public string NameofPersonwhoownsInstituteState { get; set; }
        public string NameofPersonwhoownsInstituteDistrict { get; set; }
        public string NameofPersonwhoownsInstituteTaluka { get; set; }

        public Int32 NameofPersonwhoownsInstituteCityID { get; set; }

        public string NameofPersonwhoownsInstituteCityName { get; set; }


        public Int16 SecurityQuestionID { get; set; }
        public string SecurityQuestionAnswer { get; set; }
        public string Password { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public Int16 IsAdmissionDataFetch { get; set; }

        public DateTime RegisterComplaintDate { get; set; }
        public string Detailsofthecomplaint { get; set; }
        public string Declaration {  get; set; }

        public string Place { get; set; }
        public string ComplaintNo {get; set; }
        public string ComplaintDate { get; set; }

        public List<RegisterComplaintDocumentEntity> lstRegisterComplaintDocument;
       

    }
    
}
