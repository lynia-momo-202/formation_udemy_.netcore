using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Reflection;
using System.Runtime.CompilerServices;
using testauthentificationfacebook.Areas.Identity.Data;
using testauthentificationfacebook.Data;



var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("testauthentificationfacebookContextConnection") ?? throw new InvalidOperationException("Connection string 'testauthentificationfacebookContextConnection' not found.");

//recuperation du usersecret et des var denvironement

//le usersecret test
IConfiguration? Configuration;
Configuration = builder.Configuration;
var test = Configuration["test"];
//lid de lapp face(methode simplifie https://learn.microsoft.com/fr-fr/aspnet/core/security/app-secrets?view=aspnetcore-6.0&tabs=windows)
//var face = builder.Configuration["apis:facebook:id"];

builder.Services.AddDbContext<testauthentificationfacebookContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDefaultIdentity<testauthentificationfacebookUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<testauthentificationfacebookContext>();

// Add services to the container.
builder.Services.AddControllersWithViews();

//recuperer les cles facebook pour l'authentification
builder.Services.AddAuthentication().AddFacebook(Option =>
{
    Option.AppId = builder.Configuration["apis:facebook:id"].ToString();
    Option.AppSecret = builder.Configuration["apis:facebook:secret"].ToString();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseStaticFiles();

app.UseCookiePolicy();//milddelware

app.UseRouting();
app.UseAuthentication();//milddelware d'authentification

app.UseAuthorization();

//Permet davoir access aux pages razors et aux controleur generer pourl'authentification
app.MapControllers();
app.MapRazorPages();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
