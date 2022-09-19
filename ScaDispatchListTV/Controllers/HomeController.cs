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
        SqlDataReader dr;
        SqlConnection con = new SqlConnection();
        List<Order> orders = new List<Order>();

        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            con.ConnectionString = ScaDispatchListTV.Properties.Resources.ConnectionString;
        }

        public IActionResult Index()
        {
            return View();
        }

        private void FetchData()
        {
            try
            {
                con.Open();
                com.Connection = con;
                com.CommandText = "SELECT TOP(30) Klient, Zamówienie, Nazwa, [Il.zam], Stan, ISNULL(Got, 0) Got, [Data wys] " +
                    "FROM SmayDB.dbo.ExScaDispatchListWMS " +
                    "WHERE ([Data wys] = CAST( GETDATE() AS Date )) " +
                    "ORDER BY Klient";
                dr = com.ExecuteReader();
                while (dr.Read())
                {
                    orders.Add(new Order() {Klient = dr["Klient"].ToString(),
                    Zamowienie = dr["Zamówienie"].ToString(),
                    Nazwa = dr["Nazwa"].ToString(),
                    });
                }
                con.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
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