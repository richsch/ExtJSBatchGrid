using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json.Linq;

namespace GridStore.Models
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
        public IEnumerable<BatchAction> Create { get; set; }
        public IEnumerable<BatchAction> Update { get; set; }
        public IEnumerable<BatchAction> Destroy { get; set; }
    }

    public class BatchAction
    {
        public string InternalId { get; set; }
        public JObject Data { get; set; }
    }
}