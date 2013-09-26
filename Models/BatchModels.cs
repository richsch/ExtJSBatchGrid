using System.Collections.Generic;
using System.Linq;
using Grid.Auth.Models;
using Newtonsoft.Json.Linq;

namespace Grid.Auth.Models
{
    public abstract class BatchItemModel
    {
        public int ID { get; set; }
        public abstract string ModelType { get; }
        public bool IsNew { get; set; }
    }

    public class BatchModel
    {
        public string Store { get; set; }
        public Batch Create { get; set; }
        public Batch Update { get; set; }
        public Batch Destroy { get; set; }
    }

    public class Batch
    {
        public IEnumerable<BatchAction> Actions { get; set; }
        public IEnumerable<BatchActionError> Errors { get; set; } 

        public bool HasActions {get { return Actions.Any(); }}
        public bool HasErrors {get { return Errors.Any(); }}

        public Batch()
        {
            Actions = new List<BatchAction>();
            Errors = new List<BatchActionError>();
        }
    }

    public class BatchAction
    {
        public string InternalId { get; set; }
        public JObject Data { get; set; }
    }

    public class BatchActionError
    {
        public string InternalId { get; set; }
        public string Message { get; set; }
    }
}

public static class BatchExtensions
{
    public static bool HasErrors(this IEnumerable<BatchModel> data)
    {
        return data.Any(d => d.Create.HasErrors || d.Update.HasErrors || d.Destroy.HasErrors);
    }
}