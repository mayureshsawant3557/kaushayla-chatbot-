using Portal.Entities.Registration;
using System;
using System.Collections.Generic;

namespace Portal.Entities.UnauthorizedInstitute
{
    public class EditComplainantDetailsEntity
    {
        public short IsMSBSVETPortal { get; set; }
        public string MSBSVETRegistrationNumber { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }

        public string Address { get; set; }
        public string Pincode { get; set; }
        public int StateID { get; set; }
        public string State { get; set; }
        public int DistrictID { get; set; }
        public string District { get; set; }
        public int TalukaID { get; set; }
        public string Taluka { get; set; }

        public int CityID { get; set; }

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
        public int NameofPersonwhoownsInstituteStateID { get; set; }
        public int NameofPersonwhoownsInstituteDistrictID { get; set; }
        public int NameofPersonwhoownsInstituteTalukaID { get; set; }

        public string NameofPersonwhoownsInstituteState { get; set; }
        public string NameofPersonwhoownsInstituteDistrict { get; set; }
        public string NameofPersonwhoownsInstituteTaluka { get; set; }

        public int NameofPersonwhoownsInstituteCityID { get; set; }

        public string NameofPersonwhoownsInstituteCityName { get; set; }


        public short SecurityQuestionID { get; set; }
        public string SecurityQuestionAnswer { get; set; }
        public string Password { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public short IsAdmissionDataFetch { get; set; }

        public DateTime RegisterComplaintDate { get; set; }
        public string Detailsofthecomplaint { get; set; }
        public string Declaration { get; set; }

        public string Place { get; set; }
        public string ComplaintNo { get; set; }
        public string ComplaintDate { get; set; }

        public List<RegisterComplaintDocumentEntity> lstRegisterComplaintDocument;


    }

}
