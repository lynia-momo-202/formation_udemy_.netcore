using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
namespace jeudontonestleheros.BackOffice.Web.UI.constraints
{
    public class LogConstraint : IRouteConstraint
    {
        public bool Match(HttpContext? httpContext, IRouter? route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
        {
            return values["id"].ToString()=="1";
            //throw new NotImplementedException();
        }
    }
}
