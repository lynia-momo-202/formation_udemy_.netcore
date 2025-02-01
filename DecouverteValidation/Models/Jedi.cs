using System.ComponentModel.DataAnnotations;

namespace DecouverteValidation.Models
{
    public class Jedi
    {
        [Required (AllowEmptyStrings = false , ErrorMessage ="le nom de votre jedi doit etre renseigne")] 
        public string? Name { get; set; }
        [Range(1,300,ErrorMessage = "la taille est en cm et doit entre comprise en 1 et 300 ")]
        public int Size { get; set; }
    }
}
