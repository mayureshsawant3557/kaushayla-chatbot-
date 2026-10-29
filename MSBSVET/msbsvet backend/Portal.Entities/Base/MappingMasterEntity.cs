using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class MappingMasterEntity
    {
        public Int32 MappingId { get; set; }
        public string ColumnValueEnglish { get; set; }
        public string ColumnValueMarathi { get; set; }
        public string ParentColumnValue { get; set; }

        public string ExtraColumn1Value { get; set; }
        public string ExtraColumn2Value { get; set; }
        public string ExtraColumn3Value { get; set; }
        public string ExtraColumn4Value { get; set; }


        public bool IsActive { get; set; }
        public string UserLoginId { get; set; }
        public string IPAddress { get; set; }

        public MappingMasterEntity() {
            MappingId = 0;
            IsActive = true;
            UserLoginId = "";
            IPAddress = "";
            ExtraColumn1Value = "";
            ExtraColumn2Value = "";
            ExtraColumn3Value = "";
            ExtraColumn4Value = "";
        }



    }
}
