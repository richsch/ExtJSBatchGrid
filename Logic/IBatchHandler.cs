using System.Collections.Generic;
using System.Linq;
using Grid.Auth.Models;
using Newtonsoft.Json.Linq;

namespace Grid.Auth.Logic
{
    public interface IBatchHandler<T>
    {
        IEnumerable<T> Create(IEnumerable<T> data);
        void Update(IEnumerable<T> data);
        void Delete(IEnumerable<T> data);
        T ConvertObject(JObject data);
    }

    public abstract class BatchHandler<T> : BatchHandler, IBatchHandler<T> where T : BatchItemModel
    {
        public abstract IEnumerable<T> Create(IEnumerable<T> data);
        public abstract void Update(IEnumerable<T> data);
        public abstract void Delete(IEnumerable<T> data);
        public abstract T ConvertObject(JObject data);

        public override IEnumerable<BatchAction> HandleCreate(IEnumerable<BatchAction> data)
        {
            var items = data.Select(d => d.Data).Select(ConvertObject);
            var results = Create(items).ToArray();

            var returnResult = data.ToArray();
            for (int i = 0; i < results.Length; i++)
            {
                returnResult[i].Data["ID"] = results[i].ID;
            }

            return returnResult;
        }

        public override void HandleUpdate(IEnumerable<JObject> data)
        {
            Update(data.Select(ConvertObject));
        }

        public override void HandleDelete(IEnumerable<JObject> data)
        {
            Delete(data.Select(ConvertObject));
        }
    }

    public abstract class BatchHandler
    {
        public abstract IEnumerable<BatchAction> HandleCreate(IEnumerable<BatchAction> data); 
        public abstract void HandleUpdate(IEnumerable<JObject> data);
        public abstract void HandleDelete(IEnumerable<JObject> data);
    }
}
