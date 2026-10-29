using Microsoft.SqlServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class AssociatedInstituteEntity
    {
        public Int64 AssociatedInstituteID { get; set; }
        public Int64 InstituteID { get; set; }
        public Int64 PromotingOrganisationId { get; set; }
        public Int32 PromoterTypeID { get; set; }

        public string PromoterType { get; set; }

        public string InstituteCode { get; set; }
        public string NameofInstitute { get; set; }
        public string District { get; set; }

        public Int32 DistrictID { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public string CityorVillage { get; set; }
        public Int32 txtCityorVillageID { get; set; }
        public string Remark { get; set; }
        public string IsVerified { get; set; }


        public string InstituteCodeForAppliedInstitutes { get; set; }
        public string NameofInstituteForAppliedInstitutes { get; set; }
        public string DistrictForAppliedInstitutes { get; set; }

        public Int32 DistrictIDForAppliedInstitutes { get; set; }
        public Int32 TalukaIDForAppliedInstitutes { get; set; }
        public string TalukaForAppliedInstitutes { get; set; }
        public string CityorVillageForAppliedInstitutes { get; set; }
        public Int32 txtCityorVillageIDForAppliedInstitutes { get; set; }

        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }

    }




}
