namespace Grid.Auth.Models
{
    public class SportModel : BatchItemModel
    {
        public string Sport { get; set; }

        public override string ModelType
        {
            get { return "SportModel"; }
        }
    }
}