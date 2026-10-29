using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Fee
{
    [Serializable]
    public class Request_CheckStatus_APIEntity
    {
        [JsonProperty("order_no")]
        public string TransactionId { get; set; }

        [JsonProperty("reference_no")]
        public string PaygateId { get; set; }

        public Request_CheckStatus_APIEntity()
        {
            TransactionId = "";
            PaygateId = "";
        }
    }

    [Serializable]
    public class Response_CheckStatus_APIEntity
    {
        [JsonProperty("order_no")]
        public string TransactionId { get; set; }

        [JsonProperty("reference_no")]
        public string PaygateId { get; set; }

        [JsonProperty("error_desc")] 
        public string Error_desc { get; set; }

        [JsonProperty("error_code")]
        public string Error_code { get; set; }

        [JsonProperty("status")] 
        public string Status { get; set; }

        [JsonProperty("enc_response")]
        public string Enc_response { get; set; }
        [JsonProperty("order_status")]
        public string Order_status { get; set; }
        [JsonProperty("order_amt")]
        public string Amount { get; set; }

        [JsonProperty("order_bank_ref_no")]
        public string BankReferenceNo { get; set; }

        [JsonProperty("order_bank_response")]
        public string BankResponse { get; set; }
    }
}
