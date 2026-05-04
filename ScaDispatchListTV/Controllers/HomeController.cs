using Microsoft.AspNetCore.Mvc;
using ScaDispatchListTV.Models;
using System.Diagnostics;
using System.Data.SqlClient;
using System.Data.SqlTypes;

namespace ScaDispatchListTV.Controllers
{
    public class HomeController : Controller
    {
        SqlCommand com = new SqlCommand();
        SqlConnection con = new SqlConnection();
        List<Order> orders = new List<Order>();

        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;

            //Przypisanie ConnectionStringa umieszczonego w katalogu Properties -> Resources.resx do zmiennej con.ConnectionString
            con.ConnectionString = ScaDispatchListTV.Properties.Resources.ConnectionString;
        }

        public IActionResult Index()
        {
            FetchData();
            return View(orders);
        }

        private void FetchData()
        {
            if (orders.Count > 0)
            {
                orders.Clear();
            }
            try
            {
                con.Open();
                com.Connection = con;
                com.CommandText = @"SELECT TOP (100)
                                        Klient,
                                        Zamówienie,
                                        Nazwa,
                                        [Il.zam],
                                        ISNULL(Got, 0) AS Got,
                                        [Data wys]
                                    FROM SmayDB.dbo.ExScaDispatchListTV_WMS
                                    WHERE [Data wys] = CAST(GETDATE() AS date)
                                    ORDER BY Klient, Zamówienie";
                using var dr = com.ExecuteReader();
                while (dr.Read())
                {
                    orders.Add(new Order() 
                    {
                        Klient = GetString(dr, "Klient"),
                        Zamowienie = GetString(dr, "Zamówienie"),
                        Nazwa = GetString(dr, "Nazwa"),
                        IlZam = GetString(dr, "Il.zam"),
                        Got = GetString(dr, "Got"),
                        DataWys = GetString(dr, "Data wys")
                    });
                }
                con.Close();
            }
            catch
            {
                throw;
            }
        }

        private static string GetString(SqlDataReader reader, string columnName)
        {
            var value = reader[columnName];

            return value == DBNull.Value
                ? string.Empty
                : value.ToString() ?? string.Empty;
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
