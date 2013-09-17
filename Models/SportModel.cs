using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GridStore.Models
{
    public class SportModel
    {
        public int ID { get; set; }
        public string Sport { get; set; }
        public bool IsNew { get; set; }
    }
}