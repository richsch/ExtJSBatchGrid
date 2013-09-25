using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Grid.Auth.Logic;
using Grid.Auth.Models;

namespace Grid.Auth.Controllers
{
    [Authorize]
    public class SportController : ApiController
    {
        public HttpResponseMessage Get()
        {
            var result = new
                {
                    success = true,
                    message = "",
                    data = SportLogic.Sports
                };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public HttpResponseMessage Post([FromBody]IEnumerable<SportModel> data)
        {
            var logic = new SportLogic();
            var results = logic.Create(data);
            var result = new
            {
                success = true,
                message = "",
                data = results
            };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public void Put([FromBody]IEnumerable<SportModel> data)
        {
            var logic = new SportLogic();
            logic.Update(data);
        }

        public void Delete(IEnumerable<SportModel> data)
        {
            var logic = new SportLogic();
            logic.Delete(data);
        }
    }
}
