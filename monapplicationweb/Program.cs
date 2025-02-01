using System.Configuration;
using System.Runtime.CompilerServices;
using jeudontonestleheros.Core.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using monapplicationweb.constraints;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

//recuperation du configuration settings
string? connectionString = builder.Configuration.GetConnectionString("DefaultContext");
builder.Services.AddDbContext<DefaultContext>(options => options.UseSqlServer(connectionString),ServiceLifetime.Scoped);
//filtre dexception de la bd
//Services.AddDatabaseDeveloperPageExceptionFilter();
//string connectionString = Configuration.GetConnectionString("DefaultContext");

//configuration pour le paragraphe datalayer
builder.Services.AddTransient<ParagrapheDataLayers, ParagrapheDataLayers>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

//optimisons nos urls pour etre comprehensible par l'user et le SEO(Seach Enjoy Optimisation)
//mettre les urls du plus specifique au plus generique cad des plus longues en decendant et des +use au -use
app.MapControllerRoute(
    name: "mesaventures",
    pattern: "mes-aventures",//use les tirets de 6 (-) pas les underscores(_)
    defaults: new
    {
        Controller = "Adventure",
        Action = "Index",
    }
);
app.MapControllerRoute(
    name: "createaventures",
    pattern: "create-mon-Aventure",
    defaults : new {controller =  "Adventure", action = "Create"}
    );
app.MapControllerRoute(
    name: "editaventures",
    pattern: "editer-mon-Aventure/{id}",
    defaults: new { controller = "Adventure", action = "Edit" },
    constraints: new { id = new LogConstaint() }
    );
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");



app.Run();
