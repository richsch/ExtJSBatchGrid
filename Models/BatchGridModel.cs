using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GridStore.Models
{
    public abstract class BatchGridModel
    {
        public abstract string ModelType { get; }
        public bool IsNew { get; set; }
    }
}