using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using GridStore.Models;
using Newtonsoft.Json.Linq;

namespace GridStore.Controllers
{
    public class DrinkController : ApiController
    {
        public static List<DrinkModel> drinks = new List<DrinkModel>(){
            new DrinkModel(){ID = 1, Type = "Coke"},
            new DrinkModel(){ID = 2, Type = "Sprite"},
            new DrinkModel(){ID = 3, Type = "Beer"},
        }; 

        public HttpResponseMessage Get()
        {
            var result = new
                {
                    success = true,
                    message = "",
                    data = drinks
                };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public HttpResponseMessage Post([FromBody]IEnumerable<DrinkModel> data)
        {
            var results = new List<DrinkModel>();
            foreach (var entry in data)
            {
                var newId = drinks.Max(d => d.ID) + 1;
                entry.ID = newId;

                drinks.Add(entry);
                results.Add(entry);
            }
            var result = new
            {
                success = true,
                message = "",
                data = results
            };
            // return the updated rows with their IDs for ext.JS to update the client-side values
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        public void Put([FromBody]IEnumerable<DrinkModel> data)
        {
            foreach (var entry in data)
            {
                var record = drinks.SingleOrDefault(d => d.ID == entry.ID);
                if (record != null)
                {
                    record.Type = entry.Type;
                }
            }
        }

        public void Delete(IEnumerable<DrinkModel> data)
        {
            foreach (var entry in data)
            {
                drinks.Remove(drinks.SingleOrDefault(d => d.ID == entry.ID));
            }
        }
    }
}
