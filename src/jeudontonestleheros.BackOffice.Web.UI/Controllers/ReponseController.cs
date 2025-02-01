using jeudontonestleheros.Core.Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace jeudontonestleheros.BackOffice.Web.UI.Controllers
{
    public class ReponseController : Controller
    {
        private DefaultContext _context;
        public ReponseController(DefaultContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var query = from item in _context.Reponses
                        select item;
            return View(query.ToList());
        }
        public IActionResult Add()
        {
            ViewBag.QuestionList = _context.Questions.ToList();
            return View();
        }
        [HttpPost]
        public IActionResult Add(Reponse reponse)
        {
            if(ModelState.IsValid)
            {
                _context.Reponses.Add(reponse);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(reponse);
        }
    }
}
