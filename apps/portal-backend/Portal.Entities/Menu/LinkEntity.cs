using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Menu
{
    public class LinkEntity
    {
        public Int32 LinkID { get; set; }
        public string LinkName { get; set; }
        public string LinkNameMarathi { get; set; }
        public string LinkDescription { get; set; }
        public string LinkDescriptionMarathi { get; set; }
        public string LinkURL { get; set; }
        public string LinkType { get; set; }
        public string Directory { get; set; }
        public string PageName { get; set; }
        public string QueryString { get; set; }
        public Int16 IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
