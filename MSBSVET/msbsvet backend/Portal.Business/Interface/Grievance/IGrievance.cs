using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;

namespace Portal.Business
{
    public interface IGrievance
    {
        long SendGrievance(GrievanceEntity entity);
        GrievanceEntity CheckGrievanceStatus(long GrievanceID, string MobileNo);
        DataSet GetGrievanceDashboard(int UserTypeID, string UserLoginID);
        DataTable GetPendingGrievanceList();
        DataTable GetRepliedGrievanceList();
        string ReplyGrievance(GrievanceEntity entity);
    }
}
