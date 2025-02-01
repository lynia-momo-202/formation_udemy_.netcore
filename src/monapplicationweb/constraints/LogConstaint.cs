
namespace monapplicationweb.constraints
{
    public class LogConstaint : IRouteConstraint
    {
        public bool Match(HttpContext? httpContext, IRouter? route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
        {
            if (values["id"].ToString == null)
            {
                return false;
            }
            else
            {
                return int.TryParse(values["id"].ToString(), out int r);
            }
            //throw new NotImplementedException();
        }
    }
}
