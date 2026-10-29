namespace Portal.Entities.Institute
{
    public class PromotersDetailsMappingRequest
    {
        public Int64 ID { get; set; }
        public Int64 InstituteID { get; set; }
        public string StaffID { get; set; }
        public Int16 ManagementType { get; set; }
        public string CreateBy { get; set; }
        public string IPAddress { get; set; }
    }
    public class PromotersDetailsEntity
    {
        public Int64 PromoterID { get; set; }
        public Int64 InstituteID { get; set; }
        public Int64 StaffId { get; set; }
        public string StaffProfileId { get; set; }
        public Int16 PromoterTypeID { get; set; }
        public string PromoterType { get; set; }
        //public bool IsPromoterAuthorisedRepresentive { get; set; }
        public Int16 TitleID { get; set; }
        public string Title { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string GenderCode { get; set; }
        public DateTime DOB { get; set; }
        public string FormatDOB { get; set; }
        public string AadhaarNo { get; set; }
        public string Designation { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }
        public string PhoneNo { get; set; }
        public string AadhaarPath { get; set; }
        public string PhotoPath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string IsapprovedPromoter { get; set; }
        public string RejectRemakr { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }


    }


}
