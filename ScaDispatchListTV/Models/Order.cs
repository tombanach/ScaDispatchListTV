﻿namespace ScaDispatchListTV.Models
{
    public class Order
    {
        //Model zamówienia - pola pobierane z bazy danych
        public string Klient { get; set; }
        public string Zamowienie { get; set; }
        public string Nazwa { get; set; }
        public string IlZam { get; set; }
        public string Stan { get; set; }
        public string Got { get; set; }
        public string DataWys { get; set; }
    }
}
