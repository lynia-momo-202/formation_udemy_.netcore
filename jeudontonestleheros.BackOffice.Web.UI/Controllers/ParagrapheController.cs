using jeudontonestleheros.Core.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace jeudontonestleheros.BackOffice.Web.UI.Controllers
{
    public class ParagrapheController : Controller
    {

        #region menbre privee
        private readonly DefaultContext _context;
        #endregion
        #region constructeur
        public ParagrapheController(DefaultContext context)
        {
            _context = context;
        }
        #endregion

        // GET: ParagrapheController
        public ActionResult Index()
        {
            var query = from paragraphe in _context.Paragraphes
                        select paragraphe;
            var query2 = query.ToList();
            return View(query2);
        }

        // GET: ParagrapheController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: ParagrapheController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: ParagrapheController/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Paragraphe paragraphe)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    this._context.Paragraphes.Add(paragraphe);
                    this._context.SaveChanges();
                    return RedirectToAction(nameof(Index));
                }

                return View(paragraphe);
            }
            catch
            {
                return View();
            }
        }

        // GET: ParagrapheController/Edit/5
        public ActionResult Edit(int id)
        {
            Paragraphe? paragraphe = null;
            // Paragraphe paragraphe = _maList.First(item => item.Id == id);
            paragraphe = this._context.Paragraphes.First(item => item.Id == id);
            return View();
        }

        // POST: ParagrapheController/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(Paragraphe paragraphe)
        {
            try
            {
                this._context.Update(paragraphe);
                //this._context.Attach<Paragraphe>(paragraphe);
                //this._context.Entry(paragraphe).Property(item => item.Id).IsModified = true;
                this._context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: ParagrapheController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: ParagrapheController/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }       
    }
}
