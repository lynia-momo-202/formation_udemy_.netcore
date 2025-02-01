using MesPremierstestsAvecEntityCodeFirst;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.IO;

ConfigurationBuilder builder = new();
builder.SetBasePath(Directory.GetCurrentDirectory())
                             .AddJsonFile("appsetings.json");
var config = builder.Build();
string? connectionString = config.GetConnectionString("DefaultContext");

DbContextOptionsBuilder OptionsBuilder = new();
if (connectionString != null)
{
    OptionsBuilder.UseSqlServer(connectionString);
}

using DefaultContext context = new(OptionsBuilder.Options);
var query = from droide in context.Droides
            select droide;
foreach (var item in query.ToList())
{
    Console.WriteLine(item.Matricule);
}
