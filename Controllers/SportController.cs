﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using GridStore.Models;
using Newtonsoft.Json.Linq;

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

        public HttpResponseMessage Post([FromBody]IEnumerable<SportModel> data)
        {
            var results = new List<SportModel>();
            foreach (var entry in data)
            {
                var newId = sports.Max(d => d.ID) + 1;
                entry.ID = newId;

                sports.Add(entry);
                results.Add(entry);
            }
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
            foreach (var entry in data)
            {
                var record = sports.SingleOrDefault(d => d.ID == entry.ID);
                if (record != null)
                {
                    record.Sport = entry.Sport;
                }
            }
        }

        public void Delete(IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                sports.Remove(sports.SingleOrDefault(d => d.ID == entry.ID));
            }
        }
    }
}
