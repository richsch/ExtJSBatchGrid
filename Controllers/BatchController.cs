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
    public class BatchController : ApiController
    {
        public void Post(IEnumerable<BatchModel> data)
        {
            foreach (var batch in data)
            {
                var store = batch.Store;
                // TODO: select appropriate logic element based on the store
                // TODO: apply Create actions and capture updated results (new IDs)
                // TODO: apply Update actions and return IDs
                // TODO: apply Destroy actions and return IDs
            }
            throw new NotImplementedException();
        }
    }
}
