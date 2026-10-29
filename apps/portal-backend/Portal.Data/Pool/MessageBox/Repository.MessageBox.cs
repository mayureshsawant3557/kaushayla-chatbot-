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
        public DataTable GetReceivedMessagesFromAdmin(string ReceiverID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ReceiverID", ReceiverID);

            return _dbAccess.GetDataTable("MessageBox_GetReceivedMessagesFromAdmin", param);
        }
    }
}
