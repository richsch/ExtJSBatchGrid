using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GridStore.Models
{
    public class DrinkModel
    {
        public int ID { get; set; }
        public string Type { get; set; }
        public bool IsNew { get; set; }
    }
}