using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using Portal.Entities;

namespace Portal.Business.Interface.MessageBox
{
    public interface IMessageBox
    {
        DataTable GetReceivedMessagesFromAdmin(string ReceiverID);
    }
}
