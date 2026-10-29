using System;

namespace Portal.Entities.Institute
{
    public class InspectionVerificationEntity
    {
        public long InstituteID { get; set; }
        public int  UserTypeID { get; set; }

        public string PageCode { get; set; }

        public string Status { get; set; }

        public string Remark { get; set; }

        public string CreatedBy { get; set; }

        public string IpAddress { get; set; }
    }
}