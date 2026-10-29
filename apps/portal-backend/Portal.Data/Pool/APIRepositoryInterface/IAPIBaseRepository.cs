using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public interface IAPIBaseRepository
    {
        DataTable GetMasterDistrict();
    }
}
