using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    

    
    public class InstituteInput
    {
        public long InstituteID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }

   
    public class InspectionEligibilityEntity
    {
        public bool CanRequestInspection { get; set; }
        public bool CanWithdrawInspection { get; set; }
        public string InspectionStatus { get; set; }
        public bool IsAllDataFilled { get; set; }
        public string Message { get; set; }
        public string MissingPages { get; set; }
    }

    
    public class InspectionRequestEntity
    {
        public long InstituteID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string Remarks { get; set; }
    }

    
    public class InspectionOperationResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    }

    public class VerificationEligibilityEntity
    {
        public bool IsEligible { get; set; }
        public string Message { get; set; }
        public string VerificationStatus { get; set; }
    }
}
