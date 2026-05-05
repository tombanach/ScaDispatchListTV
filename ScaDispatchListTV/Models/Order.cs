namespace ScaDispatchListTV.Models
{
    public class Order
    {
        //Model zamówienia - pola pobierane z bazy danych
        public string Klient { get; set; } = string.Empty;
        public string Zamowienie { get; set; } = string.Empty;
        public string Nazwa { get; set; } = string.Empty;
        public string IlZam { get; set; } = string.Empty;
        public string Stan { get; set; } = string.Empty;
        public string Got { get; set; } = string.Empty;
        public string DataWys { get; set; } = string.Empty;
    }
}
