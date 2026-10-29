using Portal.Entities;
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
        public DataTable GetIITIAdmissionData(string ITIRegistrationNo, string ITIFirstName, string ITIDOBITI)
        {
            if (string.IsNullOrWhiteSpace(ITIRegistrationNo))
                throw new ArgumentNullException(nameof(ITIRegistrationNo), "ITI Registration Number cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(ITIFirstName))
                throw new ArgumentNullException(nameof(ITIFirstName), "ITI First Name cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(ITIDOBITI))
                throw new ArgumentNullException(nameof(ITIDOBITI), "ITI Date of Birth cannot be null or empty.");

            if (_dbAccess == null)
                throw new InvalidOperationException("_dbAccess is not initialized.");

            var param = new Dictionary<string, object>
            {
                { "@ITIRegistrationNo", ITIRegistrationNo },
                { "@ITIFirstName", ITIFirstName },
                { "@ITIDOBITI", ITIDOBITI }
            };

            return _dbAccess?.GetDataTable("IITIAdmission_GetMasterDVETCandidate", param) ?? new DataTable();
        }

        public DataTable GetMSBVAdmissionData(string ApplicationID, string FirstName, string DOB)
        {
            if (string.IsNullOrWhiteSpace(ApplicationID))
                throw new ArgumentNullException(nameof(ApplicationID), "MSBSVET Registration Number cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(FirstName))
                throw new ArgumentNullException(nameof(FirstName), "MSBSVET First Name cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(DOB))
                throw new ArgumentNullException(nameof(DOB), "MSBSVET Date of Birth cannot be null or empty.");

            if (_dbAccess == null)
                throw new InvalidOperationException("_dbAccess is not initialized.");

            var param = new Dictionary<string, object>
            {
                { "@ApplicationID", ApplicationID },
                { "@FirstName", FirstName },
                { "@DOB", DOB }
            };

            return _dbAccess?.GetDataTable("MSBSVETAdmission_GetMasterCandidate", param) ?? new DataTable();
        }
        public DataTable GetUserData(string ITIRegistrationNo)
        {
            if (string.IsNullOrWhiteSpace(ITIRegistrationNo))
                throw new ArgumentNullException(nameof(ITIRegistrationNo), "ITI Registration Number cannot be null or empty.");

            if (_dbAccess == null)
                throw new InvalidOperationException("_dbAccess is not initialized.");

            var param = new Dictionary<string, object>
            {
                { "@ITIRegistrationNo", ITIRegistrationNo }
            };

            return _dbAccess?.GetDataTable("IITIAdmission_GetUserData", param) ?? new DataTable();
        }
    }
}
