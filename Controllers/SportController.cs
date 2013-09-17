using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using GridStore.Models;

namespace GridStore.Controllers
{
    public class SportController : ApiController
    {
        public static List<SportModel> sports = new List<SportModel>(){
            new SportModel(){ID = 1, Sport = "Rugby"},
            new SportModel(){ID = 2, Sport = "Cricket"},
            new SportModel(){ID = 3, Sport = "Tennis"},
        }; 

        public HttpResponseMessage Get()
        {
            var result = new
                {
                    success = true,
                    message = "",
                    data = sports
                };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public void Post([FromBody]SportModel data)
        {
            Post(new []{data});
        }

        // batch operation
        public void Post([FromBody]IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                var newId = sports.Max(d => d.ID) + 1;
                entry.ID = newId;

                sports.Add(entry);
            }
        }

        public void Put([FromBody] SportModel data)
        {
            Put(new []{data});
        }

        // batch operation
        public void Put([FromBody] IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                var record = sports.SingleOrDefault(d => d.ID == entry.ID);
                if (record != null)
                {
                    record.Sport = entry.Sport;
                }
            }
        }

        public void Delete([FromBody] SportModel data)
        {
            Delete(new []{data});
        }

        // batch operation
        public void Delete([FromBody] IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                sports.Remove(sports.SingleOrDefault(d => d.ID == entry.ID));
            }
        }
    }
}
