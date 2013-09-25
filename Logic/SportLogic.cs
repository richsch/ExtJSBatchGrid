using System.Collections.Generic;
using System.Linq;
using Grid.Auth.Models;
using Newtonsoft.Json.Linq;

namespace Grid.Auth.Logic
{
    public class SportLogic : BatchHandler<SportModel>
    {
        public static List<SportModel> Sports = new List<SportModel>(){
            new SportModel(){ID = 1, Sport = "Rugby"},
            new SportModel(){ID = 2, Sport = "Cricket"},
            new SportModel(){ID = 3, Sport = "Tennis"},
        }; 

        public override IEnumerable<SportModel> Create(IEnumerable<SportModel> data)
        {
            var results = new List<SportModel>();
            foreach (var entry in data)
            {
                var newId = Sports.Max(d => d.ID) + 1;
                entry.ID = newId;

                Sports.Add(entry);
                results.Add(entry);
            }
            return results;
        } 

        public override void Update(IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                var record = Sports.SingleOrDefault(d => d.ID == entry.ID);
                if (record != null)
                {
                    record.Sport = entry.Sport;
                }
            }
        }

        public override void Delete(IEnumerable<SportModel> data)
        {
            foreach (var entry in data)
            {
                Sports.Remove(Sports.SingleOrDefault(d => d.ID == entry.ID));
            }
        }

        public override SportModel ConvertObject(JObject data)
        {
            return data.ToObject<SportModel>();
        }
    }
}