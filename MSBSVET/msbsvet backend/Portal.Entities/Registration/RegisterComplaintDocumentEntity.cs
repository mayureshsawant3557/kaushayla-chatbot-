//using AjaxControlToolkit.HtmlEditor.ToolbarButtons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Entities.Registration
{
	public class RegisterComplaintDocumentEntity
    {
        public Int64 UserID { get; set; }
        public Int64 DocumentID { get; set; }
        public string DocumentName { get; set; }
        public string DocumentPath { get; set; }
        public string UserLoginID { get; set; }
		public string IPAddress { get; set; }
		public string PageCode { get; set; }

	}
}
