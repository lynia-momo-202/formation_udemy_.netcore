using jeudontonestleheros.Core.Data.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
//var connectionString = builder.Configuration.GetConnectionString("DefaultContext");
// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddDbContext<DefaultContext>
        (option =>option.UseSqlServer(
                            builder.Configuration.GetConnectionString("DefaultContext")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
