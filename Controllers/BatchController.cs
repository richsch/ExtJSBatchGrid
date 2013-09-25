using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Grid.Auth.Logic;
using Grid.Auth.Models;

namespace Grid.Auth.Controllers
{
    [Authorize]
    public class BatchController : ApiController
    {
        public IEnumerable<BatchModel> Post(IEnumerable<BatchModel> data)
        {
            foreach (var batch in data)
            {
                var handler = GetBatchHandler(batch.Store);

                if (batch.Create.Any())
                {
                    var results = handler.HandleCreate(batch.Create);
                    batch.Create = results;
                }
                if (batch.Update.Any())
                {
                    handler.HandleUpdate(batch.Update.Select(d => d.Data));
                    batch.Update = new List<BatchAction>();
                }
                if (batch.Destroy.Any())
                {
                    handler.HandleDelete(batch.Destroy.Select(d => d.Data));
                    batch.Destroy = new List<BatchAction>();
                }
            }
            return data;
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
