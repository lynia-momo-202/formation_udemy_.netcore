using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting.Logging;
using monapplicationweb.Controllers;

namespace TestsWebUI
{
    [TestClass]
    public class HomeControllerUnitTest
    {
        [TestMethod]
        public void TestAboutIsOk()
        {
            HomeController controller = new HomeController() ;
            var result = controller.About() ;
            Assert.IsInstanceOfType(result,typeof(ViewResult)) ;
            ViewResult? viewResult = result as ViewResult;
            Assert.IsNotNull(viewResult.ViewData["Message"]);
            Assert.IsTrue(viewResult.ViewData["Message"] == "your application description page") ;

        }
    }
}