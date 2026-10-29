
using Portal.Entities;
using Portal.Entities.Services;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Services
{
    public interface IBaseService
    {
        ResponseEntity GetMasterDistrict();
    }
}
