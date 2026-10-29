using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class RequiredDocumentEntity
    {
        public Int64 CandidateID { get; set; }
        public Int32 DocumentID { get; set; }
        public string DocumentName { get; set; }
        public string DocumentGroup { get; set; }
        public bool IsDocumentUploaded { get; set; }
        public string DocumentUploadedURL { get; set; }
        public string CCStatus { get; set; }
        public string NCLStatus { get; set; }
        public bool IsCompulsory { get; set; }
        public bool IsVerified { get; set; }
        public string VerificationStatus { get; set; }
        public string VerificationComments { get; set; }
        public Int16 DocumentsVerificationType { get; set; }
        public bool IsAllCompulsoryDocumentsUploaded { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public Int16 RegionID { get; set; }
        public Int16 IsResponseFromApi { get; set; }        
    }
}
