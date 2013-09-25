namespace Grid.Auth.Models
{
    public class DrinkModel : BatchItemModel
    {
        public string Type { get; set; }

        public override string ModelType
        {
            get { return "DrinkModel"; }
        }
    }
}