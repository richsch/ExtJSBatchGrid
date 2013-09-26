using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Grid.Auth.Logic;
using Grid.Auth.Models;

namespace Grid.Auth.Controllers
{
    [Authorize]
    public class BatchController : ApiController
    {
        public HttpResponseMessage Post(IEnumerable<BatchModel> data)
        {
            foreach (var batch in data)
            {
                var handler = GetBatchHandler(batch.Store);

                if (batch.Create.HasActions)
                {
                    var results = handler.HandleCreate(batch.Create);
                    batch.Create = results;
                }
                if (batch.Update.HasActions)
                {
                    
                    batch.Update.Errors = handler.HandleUpdate(batch.Update);
                    batch.Update.Actions = new List<BatchAction>();
                }
                if (batch.Destroy.HasActions)
                {
                    batch.Destroy.Errors = handler.HandleDelete(batch.Destroy);
                    batch.Destroy.Actions = new List<BatchAction>();
                }
            }

            if (!data.HasErrors())
            {
                // do Repository commit here
            }

            var result = new
            {
                success = !data.HasErrors(),
                message = data.HasErrors() ? "There was a problem saving the data. Please correct any errors." : "",
                data = data
            };
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        private BatchHandler GetBatchHandler(string storeName)
        {
            switch (storeName)
            {
                case "Transactions.store.DrinkStore":
                    return new DrinkLogic();
                case "Transactions.store.SportStore":
                    return new SportLogic();
            }
            throw new NotImplementedException();
        }
    }
}
