namespace Portal.Server.Controllers.Institute
{
    public class TrainingFeeModel
    {

        public   string actionType { get; set; }
            
            public int? id { get; set; } 
            public string trainingFeeID { get; set; }

                                public decimal? withPlacement { get; set; }
             public decimal? withoutPlacement { get; set; }

                               public string userName { get; set; }
             public string userIpAddress { get; set; }
    }
}