namespace Portal.Entities.DVETO
{
    public class DVETOBaseEntity
    {
        public long OfficeID { get; set; }

        public string OfficeCode { get; set; }

        public string OfficeName { get; set; }

        public DateTime? EstablishmentDate { get; set; }

        public string OfficeAddress { get; set; }

        public string PinCode { get; set; }

        public int StateID { get; set; }

        public string State { get; set; }

        public int DistrictID { get; set; }

        public string District { get; set; }

        public int TalukaID { get; set; }

        public string Taluka { get; set; }

        public int CityID { get; set; }

        public string City { get; set; }

        public string OtherCity { get; set; }

        public int LocationCategoryID { get; set; }

        public string LocationCategory { get; set; }

        public string STD { get; set; }

        public string PhoneNo { get; set; }

        public string EMailID { get; set; }

        public string Website { get; set; }

        // ⭐ Missing field from Stored Procedure
        public string ResolutionPath { get; set; }

        public string Latitude { get; set; }

        public string Longitude { get; set; }

        public string UserLoginID { get; set; }

        public string IPAddress { get; set; }
    }
}