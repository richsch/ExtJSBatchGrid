using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Grid.Auth.Logic;
using Grid.Auth.Models;

namespace Grid.Auth.Controllers
{
    [Authorize]
    public class DrinkController : ApiController
    {
        public HttpResponseMessage Get()
        {
            var result = new
            {
                success = true,
                message = "",
                data = DrinkLogic.Drinks
            };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public HttpResponseMessage Post([FromBody]IEnumerable<DrinkModel> data)
        {
            var logic = new DrinkLogic();
            var results = logic.Create(data);
            var result = new
            {
                success = true,
                message = "",
                data = results
            };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public void Put([FromBody]IEnumerable<DrinkModel> data)
        {
            var logic = new DrinkLogic();
            logic.Update(data);
        }

        public void Delete(IEnumerable<DrinkModel> data)
        {
            var logic = new DrinkLogic();
            logic.Delete(data);
        }
    }
}
