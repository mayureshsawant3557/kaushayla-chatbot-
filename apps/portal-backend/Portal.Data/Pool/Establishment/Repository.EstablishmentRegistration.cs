using Portal.Entities;
using Portal.Entities.Establishment;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public Repository()
        {
        }

        public object RepositoryMaster { get; set; }

        //public DataTable GetCoursesForAdmissionITISTT(short sectorID, short courseCategoryID, string courseType, short entryQualificationID, int courseID)
        //{
        //    throw new NotImplementedException();
        //}

        public DataTable GetEstablishmentRegistration(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetRegistration", param);
        }
        public string SaveEstablishmentRegistration(EstablishmentRegistrationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@TAN", entity.TAN);
            param.Add("@TIN", entity.TIN);
            param.Add("@GST", entity.GST);
            param.Add("@UdyogAadhaar", entity.UdyogAadhaar);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveRegistration", param).ToString();
        }
    }
}
