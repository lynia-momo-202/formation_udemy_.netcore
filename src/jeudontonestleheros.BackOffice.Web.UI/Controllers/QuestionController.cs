using jeudontonestleheros.Core.Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace jeudontonestleheros.BackOffice.Web.UI.Controllers
{
    public class QuestionController : Controller
    {
        private DefaultContext _context;
        public QuestionController(DefaultContext context) 
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var query = from item in _context.Questions
                        select item;
            
            return View(query.ToList());
        }
        public IActionResult Add()
        {
            ViewBag.ParagrapheList = _context.Paragraphes.ToList();
            return View();
        }
        [HttpPost]
        public IActionResult Add(Question question)
        {
            if(ModelState.IsValid) 
            {
                _context.Questions.Add(question);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(question);
            }
    }
}
