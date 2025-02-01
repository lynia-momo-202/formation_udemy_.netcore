using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace jeudontonestleheros.Core.Data.Models
{
    public class Reponse
    {
        #region propriete
        /// <summary>
        /// id de la reponse
        /// </summary>
        [Key]
        public int Id { get; set; }
        /// <summary>
        /// proposition de reponse
        /// </summary>
        [Required]
        public string? Description{ get; set; }
        /// <summary>
        /// cle etrangere de question
        /// </summary>
        [Required]
        public int QuestionId { get; set; }
        /// <summary>
        /// Id du paragraphe suivant
        /// </summary>
        public int? ParagrapheId { get; set; }
        
        #endregion
    }
}
