// See https://aka.ms/new-console-template for more information
using jeudontonestleheros.Core.Data.Models;
using System.Data.SqlClient;
namespace CallingAdoNet
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello Word La MPL!!!!!!  :):);)");
            using(SqlConnection conn = new SqlConnection())
            {
                conn.ConnectionString = "Server=DESKTOP-VR48D1C\\SQLEXPRESS;Database=JeuDontOnEstLeHeros.database.dev;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False ";
                conn.Open();
                using(var command = conn.CreateCommand())
                {
                    command.CommandText = "SELECT * FROM Paragraphe";
                    using(var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Console.WriteLine(reader["Titre"]);
                            var paragraphe = new Paragraphe()
                            {
                                Titre = reader["titre"].ToString(),
                            };
                        }
                    }
                }
                conn.Close();
            }
        }
    }
}