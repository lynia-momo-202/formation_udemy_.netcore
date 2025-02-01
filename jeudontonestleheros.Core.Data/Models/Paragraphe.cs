using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace jeudontonestleheros.Core.Data.Models
{
    public class Paragraphe
    {
        /// <summary>
        /// id venant de la base
        /// </summary>
        #region proprietes
        [Key]
        public int Id { get; set; }
        /// <summary>
        /// numero a afficher pour le jeu
        /// </summary>
        [Required(ErrorMessage = "le numero est obligatoire"), Range(1,999999999,ErrorMessage = "le numero est compris entre 1 et 999999999")]
        public int? Numero { get; set; }
        /// <summary>
        /// titre du paragraphe
        /// </summary>
        [Required(AllowEmptyStrings = false, ErrorMessage = "le titre est obligatoire")]
        public string? Titre { get; set; }
        /// <summary>
        /// description du paragraphe
        /// </summary>
        [Required(AllowEmptyStrings = false, ErrorMessage = "la description doit etre inscrite")]
        public string? Description { get; set; }
        /// <summary>
        /// booleen qui indique quil sagit du paragraphe initial ou pas
        /// </summary>
        [Required]
        public bool EstInitial { get; set; }
        //[NotMapped] pertmet que la classe ne soit pas generer par entity
        /// <summary>
        /// question contenu dans le paragraphe
        /// </summary>
        public Question? MaQuestion { get; set; }
        /// <summary>
        /// liste des reponses possible
        /// </summary>
        public IEnumerable<Reponse>? Reponses { get; set;}

        #endregion
    }
}
