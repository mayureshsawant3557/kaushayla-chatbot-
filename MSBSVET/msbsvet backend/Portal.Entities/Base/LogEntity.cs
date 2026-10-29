using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    [Serializable]
    public class LogEntity
    {
        public LogEntity()
        {
            LogType = "";
            LogSource = "";
            UserLoginID = "";
            CustomMessage = "";
            ErrorMessage = "";
            InnerException = "";
            LogDateTime = "";
            BrowserInfo = new BrowserEntity();
        }
           
        public string LogType { get; set; }
        public string LogSource { get; set; }        
        public string UserLoginID { get; set; }
        public string CustomMessage { get; set; }
        public string ErrorMessage { get; set; }
        public string InnerException { get; set; }
        public string LogDateTime { get; set; }
        public BrowserEntity BrowserInfo { get; set; }
    }

    [Serializable]
    public class BrowserEntity
    {
        public BrowserEntity()
        {
            URL = "";
            BrowserName = "";
            BrowserVersion = "";
            UserHostAddress = "";
            UserHostAddress = "";
            UserAgent = "";
        }

        public string URL { get; set; }
        public string BrowserName { get; set; }
        public string BrowserVersion { get; set; }
        public string UserHostAddress { get; set; }
        public string UserHostName { get; set; }
        public string UserAgent { get; set; }
    }
}
