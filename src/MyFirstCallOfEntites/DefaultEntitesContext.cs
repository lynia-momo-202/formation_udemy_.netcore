using jeudontonestleheros.Core.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace MyFirstCallOfEntites
{
    internal class DefaultEntitesContext:DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseSqlServer("Server=DESKTOP-VR48D1C\\SQLEXPRESS;Database=JeuDontOnEstLeHeros.database.dev;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False ");
        }
        public DbSet<Paragraphe> Paragraphes { get; set; }
    }
}
