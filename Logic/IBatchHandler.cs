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
        public abstract BatchActionError ValidateObject(string internalId, T item);

        public override Batch HandleCreate(Batch data)
        {
            var items = data.Actions.Select(d => d.Data).Select(ConvertObject);
            var errors = data.Actions.Select(d => ValidateObject(d.InternalId, ConvertObject(d.Data))).Where(d => d != null);

            var returnResult = data.Actions.ToArray();
            if (!errors.Any())
            {
                var results = Create(items).ToArray();
                for (int i = 0; i < results.Length; i++)
                {
                    returnResult[i].Data["ID"] = results[i].ID;
                }
            }

            var finalResult = new Batch()
                {
                    Actions = returnResult,
                    Errors = errors
                };
            return finalResult;
        }

        public override IEnumerable<BatchActionError> HandleUpdate(Batch data)
        {
            var errors = data.Actions.Select(d => ValidateObject(d.InternalId, ConvertObject(d.Data))).Where(d => d != null);

            if (!errors.Any())
            {
                var items = data.Actions.Select(d => d.Data).Select(ConvertObject);
                Update(items);
            }
            return errors;
        }

        public override IEnumerable<BatchActionError> HandleDelete(Batch data)
        {
            var errors = new List<BatchActionError>();

            Delete(data.Actions.Select(d => ConvertObject(d.Data)));

            return errors;
        }
    }

    public abstract class BatchHandler
    {
        public abstract Batch HandleCreate(Batch data);
        public abstract IEnumerable<BatchActionError> HandleUpdate(Batch data);
        public abstract IEnumerable<BatchActionError> HandleDelete(Batch data);
    }
}
