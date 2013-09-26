using System.Collections.Generic;
using System.Linq;
using Grid.Auth.Models;
using Newtonsoft.Json.Linq;

namespace Grid.Auth.Logic
{
    public class DrinkLogic : BatchHandler<DrinkModel>
    {
        public static List<DrinkModel> Drinks = new List<DrinkModel>(){
            new DrinkModel(){ID = 1, Type = "Coke"},
            new DrinkModel(){ID = 2, Type = "Sprite"},
            new DrinkModel(){ID = 3, Type = "Beer"},
        }; 

        public override IEnumerable<DrinkModel> Create(IEnumerable<DrinkModel> data)
        {
            var results = new List<DrinkModel>();
            foreach (var entry in data)
            {
                var newId = Drinks.Max(d => d.ID) + 1;
                entry.ID = newId;

                Drinks.Add(entry);
                results.Add(entry);
            }
            return results;
        }

        public override void Update(IEnumerable<DrinkModel> data)
        {
            foreach (var entry in data)
            {
                var record = Drinks.SingleOrDefault(d => d.ID == entry.ID);
                if (record != null)
                {
                    record.Type = entry.Type;
                }
            }
        }

        public override void Delete(IEnumerable<DrinkModel> data)
        {
            foreach (var entry in data)
            {
                Drinks.Remove(Drinks.SingleOrDefault(d => d.ID == entry.ID));
            }
        }

        public override DrinkModel ConvertObject(JObject data)
        {
            return data.ToObject<DrinkModel>();
        }

        public override BatchActionError ValidateObject(string internalId, DrinkModel item)
        {
            if (item.Type.ToLowerInvariant().Contains("vodka"))
            {
                return new BatchActionError() {InternalId = internalId, Message = "No vodka allowed!"};
            }
            return null;
        }
    }
}