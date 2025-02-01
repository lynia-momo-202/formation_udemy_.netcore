using Azure;
using Microsoft.EntityFrameworkCore;

namespace jeudontonestleheros.Core.Data.Models
{
    public class DefaultContext : DbContext
    {
        public DefaultContext(DbContextOptions<DefaultContext> options) : base(options)
        {
        }

        //protected DefaultContext()
        //{
       // }
        #region proprietes
        public DbSet<Adventure> Adventures { get; set; }
        public DbSet<Paragraphe>Paragraphes { get; set; }
        public DbSet<Question>Questions { get; set; }
        public DbSet<Reponse> Reponses { get; set; }
        #endregion
        //metre au singulier le nom de la bd
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Adventure>().ToTable("Adventure");
            modelBuilder.Entity<Paragraphe>().ToTable("Paragraphe");
            modelBuilder.Entity<Question>().ToTable("Question");
            modelBuilder.Entity<Reponse>().ToTable("Reponse");

        }
        //lorsquon effectue un database first , on cree un fichier edmx qui permetre de generer automatiquement nos classe depuis la bd ;)
        // losquon effectue un code first , on creer des classe qui vont permetrer de generer nore bd a travers la classe de context et entity:)

    }
}
