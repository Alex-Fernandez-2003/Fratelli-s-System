using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RestaurantSystem.Infrastructure;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5057");
builder.Services.AddProblemDetails();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy.WithOrigins("http://localhost:8087").AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddHealthChecks();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
var jwt = builder.Configuration.GetRequiredSection("Jwt");
var key = jwt["Key"];
if (string.IsNullOrWhiteSpace(key))
{
    throw new InvalidOperationException("Jwt__Key must be configured outside version control.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => options.TokenValidationParameters = new()
{
    ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
    ValidIssuer = jwt["Issuer"], ValidAudience = jwt["Audience"], IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
});
builder.Services.AddAuthorization();
var app = builder.Build();
app.UseExceptionHandler();
app.UseCors("frontend");
if (app.Environment.IsDevelopment()) { app.MapOpenApi(); app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthentication(); app.UseAuthorization();
app.MapHealthChecks("/health");
app.MapHub<KitchenHub>("/hubs/kitchen");
app.Run();
public sealed class KitchenHub : Microsoft.AspNetCore.SignalR.Hub { }
public partial class Program { }
