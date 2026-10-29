using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Configuration;

using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data.Source
{
    public class SSCConnection
    {
        private static string connectionString = ConfigurationManager.ConnectionStrings["SSCDBConnection"].ConnectionString;
        private static SSCConnection singleton;
        private static SqlConnection sqlConnection;

        public SqlConnection SqlConnetionFactory
        {
            get { return sqlConnection; }
        }

        private SSCConnection() { }

        public static SSCConnection Singleton
        {
            get
            {
                if (singleton == null)
                    singleton = new SSCConnection();

                sqlConnection = new SqlConnection(connectionString);
                return singleton;
            }
        }
    }
}
