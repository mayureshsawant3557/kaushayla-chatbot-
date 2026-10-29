using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Business.Interface.Certificate;
using Portal.Business.Worker.Utility;
using Portal.Data.Pool.Certificate;
using Portal.Entities.Certificate;

namespace Portal.Business.Worker.Certificate
{
    public class VerificationCertificateRequestWorker : IVerificationCertificateRequest
    {
        private readonly VerificationCertificateRequestRepository _objData;

        public VerificationCertificateRequestWorker(VerificationCertificateRequestRepository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData));
        }

        public VerificationCertificateRequestEntity GetVerificationCertificateRequestByRequestNo(string requestNo)
        {
            VerificationCertificateRequestEntity obj = new VerificationCertificateRequestEntity();
            try
            {
                DataTable dt = _objData.GetVerificationCertificateRequestByRequestNo(requestNo);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.ID = SafeConvertToInt64(dr, "ID");
                    obj.RequestNo = SafeConvertToString(dr, "RequestNo");
                    obj.Designation = SafeConvertToString(dr, "Designation");
                    obj.OrganizationName = SafeConvertToString(dr, "OrganizationName");
                    obj.OrganizationAddress = SafeConvertToString(dr, "OrganizationAddress");
                    obj.PinCode = SafeConvertToString(dr, "PinCode");
                    obj.StateID = SafeConvertToNullableInt32(dr, "StateID");
                    obj.DistrictID = SafeConvertToNullableInt32(dr, "DistrictID");
                    obj.TalukaID = SafeConvertToNullableInt32(dr, "TalukaID");
                    obj.CityID = SafeConvertToNullableInt32(dr, "CityID");
                    obj.PrimaryMobile = SafeConvertToString(dr, "PrimaryMobile");
                    obj.OtpVerified = SafeConvertToNullableBool(dr, "OtpVerified");
                    obj.PaymentStatus = SafeConvertToString(dr, "PaymentStatus");
                    obj.TransactionID = SafeConvertToString(dr, "TransactionID");
                    obj.FeeAmount = SafeConvertToNullableDecimal(dr, "FeeAmount");
                    obj.Status = SafeConvertToString(dr, "Status");
                    obj.CreatedDate = SafeConvertToNullableDateTime(dr, "CreatedDate");
                    obj.CreatedBy = SafeConvertToNullableInt64(dr, "CreatedBy");
                    obj.PrintedOn = SafeConvertToNullableDateTime(dr, "PrintedOn");
                    obj.UpdatedBy = SafeConvertToNullableInt64(dr, "UpdatedBy");
                    obj.IPAddress = SafeConvertToString(dr, "IPAddress");
                    obj.PageCode = SafeConvertToString(dr, "PageCode");
                    obj.ProfileID = SafeConvertToNullableInt32(dr, "ProfileID");
                    obj.IsActive = SafeConvertToNullableBool(dr, "IsActive");
                    obj.Name = SafeConvertToString(dr, "Name");
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetVerificationCertificateRequestByRequestNo", null);
                throw;
            }
            return obj;
        }

        // Safe conversion helper methods
        private long SafeConvertToInt64(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return 0;

                if (dr[columnName] is long longValue)
                    return longValue;

                if (dr[columnName] is int intValue)
                    return intValue;

                string value = dr[columnName].ToString().Trim();
                if (string.IsNullOrEmpty(value))
                    return 0;

                if (long.TryParse(value, out long result))
                    return result;

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long? SafeConvertToNullableInt64(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return null;

                if (dr[columnName] is long longValue)
                    return longValue;

                if (dr[columnName] is int intValue)
                    return intValue;

                string value = dr[columnName].ToString().Trim();
                if (string.IsNullOrEmpty(value))
                    return null;

                if (long.TryParse(value, out long result))
                    return result;

                return null;
            }
            catch
            {
                return null;
            }
        }

        private int? SafeConvertToNullableInt32(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return null;

                if (dr[columnName] is int intValue)
                    return intValue;

                string value = dr[columnName].ToString().Trim();
                if (string.IsNullOrEmpty(value))
                    return null;

                if (int.TryParse(value, out int result))
                    return result;

                return null;
            }
            catch
            {
                return null;
            }
        }

        private string SafeConvertToString(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return string.Empty;

                return dr[columnName].ToString().Trim();
            }
            catch
            {
                return string.Empty;
            }
        }

        private bool? SafeConvertToNullableBool(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return null;

                if (dr[columnName] is bool boolValue)
                    return boolValue;

                string value = dr[columnName].ToString().Trim().ToLower();
                if (string.IsNullOrEmpty(value))
                    return null;

                if (bool.TryParse(value, out bool result))
                    return result;

                // Handle common boolean representations
                if (value == "1" || value == "true" || value == "yes" || value == "y")
                    return true;
                if (value == "0" || value == "false" || value == "no" || value == "n")
                    return false;

                return null;
            }
            catch
            {
                return null;
            }
        }

        private decimal? SafeConvertToNullableDecimal(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return null;

                if (dr[columnName] is decimal decimalValue)
                    return decimalValue;

                string value = dr[columnName].ToString().Trim();
                if (string.IsNullOrEmpty(value))
                    return null;

                if (decimal.TryParse(value, out decimal result))
                    return result;

                return null;
            }
            catch
            {
                return null;
            }
        }

        private DateTime? SafeConvertToNullableDateTime(DataRow dr, string columnName)
        {
            try
            {
                if (dr[columnName] == null || dr[columnName] == DBNull.Value)
                    return null;

                if (dr[columnName] is DateTime dateValue)
                    return dateValue;

                string value = dr[columnName].ToString().Trim();
                if (string.IsNullOrEmpty(value))
                    return null;

                if (DateTime.TryParse(value, out DateTime result))
                    return result;

                return null;
            }
            catch
            {
                return null;
            }
        }
    }


}
