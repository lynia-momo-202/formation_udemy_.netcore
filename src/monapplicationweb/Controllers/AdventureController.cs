using jeudontonestleheros.Core.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace monapplicationweb.Controllers
{
    public class AdventureController : Controller
    {
        public readonly DefaultContext _context ;//injection de dependance
        private readonly ParagrapheDataLayers _paragrapheLayers;
        private ParagrapheDataLayers? _paragraphelayers;
        //recuperer les avantures dans la basedonnee
        public AdventureController(DefaultContext context , ParagrapheDataLayers paragrapheLayers)
        {
            this._context = context;
            _paragrapheLayers = paragrapheLayers;
        }
        // GET: AdventureController
        public ActionResult Index()
            //async Task<IActionResult>  X
        {
            this.ViewBag.monTitre = "Aventures";

            var query = from item in _context.Adventures
                        select item;
            //ViewBag.monTableau = new int[] { 1, 2, 3, 4, 5 };
            return View(query.ToList());
        }

        // GET: AdventureController/Details/5
        public ActionResult Edit(int id)
        {
            Adventure? adventure;
            adventure = _context.Adventures.First(x => x.Id == id);    
            return View();
        }

        [HttpPost]
        public IActionResult Edit(Adventure adventure)
        {
            _context.Adventures.Update(adventure);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        // GET: AdventureController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: AdventureController/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Adventure adventure)
        {
            try
            {
                if(ModelState.IsValid)
                {
                    _context.Adventures.Add(adventure);
                    _context.SaveChanges();
                    return RedirectToAction(nameof(Index));
                }
                else
                {
                    return View(adventure);
                }
            }
            catch
            {
                return View();
            }
        }


        // GET: AdventureController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        /// <summary>
        /// action pour la vue de recuperation du paragraphe
        /// </summary>
 
        public IActionResult BeginNewOne(int id)
        {
            Paragraphe item;
            if (id == 0)
            {
                item = _paragrapheLayers.GetFirst();
            }
            else 
            {
                item = _paragrapheLayers.GetOne(id);
            }
            return View(item);
        }
        // POST: AdventureController/Delete/5
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
