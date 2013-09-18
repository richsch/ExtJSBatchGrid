using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GridStore.Models
{
    public class SportModel : BatchGridModel
    {
        public int ID { get; set; }
        public string Sport { get; set; }

        public override string ModelType
        {
            get { return "SportModel"; }
        }
    }
}