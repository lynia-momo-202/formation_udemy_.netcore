using DecouverteSession.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Http;

namespace DecouverteSession.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            //this.ViewData["date"] = DateTime.Now.Ticks.ToString();
            //il nest visible que dans la vue index
            //cration dune session pour le rendre visible dans toutes les vues
            this.HttpContext.Session.SetString("Ticks", DateTime.Now.Ticks.ToString());//necesite une configuration dans program.cs
            this.ViewData["date"] = this.HttpContext.Session.GetString("Ticks");
            return View();
        }

        public IActionResult Privacy()
        {
            this.ViewData["date"] = this.HttpContext.Session.GetString("Ticks");
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}