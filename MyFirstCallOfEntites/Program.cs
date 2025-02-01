// See https://aka.ms/new-console-template for more information
using MyFirstCallOfEntites;

namespace CallingAdoNet
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var context = new DefaultEntitesContext())
            {
                //requete linQ voir cours c#11
                var request = from paragraphe in context.Paragraphes
                              select paragraphe;
                var list = request.ToList();

                list.ForEach(item => Console.WriteLine(item.Titre));
                //ajout
                /*
                    context.Paragraphes.Add(new Paragraphe(){
                        Id=2,
                        Titre = "lampl"
                    });
                    context.SaveChanges();
                */
            }

        }
    }
}