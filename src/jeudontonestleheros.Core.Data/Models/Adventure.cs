using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace jeudontonestleheros.Core.Data.Models
{
    public class Adventure
    {
        #region Propriete
        [Key]
        public int Id { get; set; }
        [Required]
        public string? Titre { get; set; }
        #endregion
    }
}
