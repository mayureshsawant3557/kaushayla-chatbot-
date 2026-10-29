namespace Portal.Server.Dto
{
    public class PromotingOrganizationRegistrationDto
    {
        public string ProfileID { get; set; } = String.Empty;
        public int RegistrationFor { get; set; }
        public string OrganizatioRegistrationNumber { get; set; } = String.Empty;
        public string NameOfPromotingOrganization { get; set; }
        public DateTime DateOfRegistration { get; set; }
        public string PromotingOrganizationAddress { get; set; }

        public int StateID { get; set; }
        public int DistrictID { get; set; }
        public int TalukaID { get; set; }
        public int CityID { get; set; }
        public string CityName { get; set; }

        public string PinCode { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }

        public int OrganisationTypeID { get; set; }
        public int PromoterStatusID { get; set; }

        public int SecurityQuestionId { get; set; }
        public string SecurityAnswer { get; set; }
        public string Password { get; set; }

        public AuthorizedRepresentativeDto AuthorizedRepresentative { get; set; }
        public string PromotingOrganizationTypeOther { get; set; } = String.Empty;

        public string IpAddress { get; set; } = String.Empty;   // 👈 new
    }

    public class AuthorizedRepresentativeDto
    {
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public DateTime DOB { get; set; }
        public string AadhaarNo { get; set; }
        public string MobileNo { get; set; }
        public string EMailID { get; set; }
        public string ApplicationID { get;  set; }
        public string Title { get;  set; }
        public string? AltMobileNo { get;  set; }
    }

}
