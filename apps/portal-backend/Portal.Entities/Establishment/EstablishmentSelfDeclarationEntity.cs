using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentSelfDeclarationEntity
    {
        public Int64 EstablishmentID { get; set; }
        public bool IsSelfDeclared { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
