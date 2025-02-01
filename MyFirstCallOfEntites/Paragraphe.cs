using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyFirstCallOfEntites
{
    [Table("Paragraphe")]
    public class Paragraphe
    {
        public int Id { get; set; }
        public string? Titre { get; set; }
    }
}
