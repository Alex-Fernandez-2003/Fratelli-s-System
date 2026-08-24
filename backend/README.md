# Backend

La API usa .NET SDK 10 y PostgreSQL local. Mantenga las credenciales y la clave JWT fuera del repositorio y de las variables de sesión del terminal.

## Configuración local

Desde `backend/`, siga este flujo:

1. Verifique que PostgreSQL esté disponible localmente y cree o elija una base de datos para el proyecto.
2. El proyecto de API ya declara un `UserSecretsId`. Inicialice User Secrets **solo si fuera necesario** (por ejemplo, si un clon o proyecto no lo tuviera):

   ```powershell
   dotnet user-secrets init --project ./src/RestaurantSystem.Api/RestaurantSystem.Api.csproj
   ```

3. Configure sus valores locales; los marcadores son intencionales y no son secretos reales:

   ```powershell
   dotnet user-secrets set "ConnectionStrings:RestaurantSystem" "<postgresql-connection-string>" --project ./src/RestaurantSystem.Api/RestaurantSystem.Api.csproj
   dotnet user-secrets set "Jwt:Key" "<development-jwt-secret>" --project ./src/RestaurantSystem.Api/RestaurantSystem.Api.csproj
   ```

4. Para generar una clave JWT aleatoria compatible con PowerShell 5.1 y guardarla en User Secrets:

   ```powershell
       $bytes = New-Object byte[] 64
       $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
       $rng.GetBytes($bytes)
       $jwtKey = [System.Convert]::ToBase64String($bytes)
       dotnet user-secrets set "Jwt:Key" $jwtKey --project ./src/RestaurantSystem.Api/RestaurantSystem.Api.csproj
       $rng.Dispose()
       Remove-Variable jwtKey, bytes, rng

   ```

5. Aplique las migrations técnicas:

   ```powershell
   dotnet ef database update --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --no-build
   ```

`src/RestaurantSystem.Api/appsettings.Development.example.json` está versionado únicamente como ejemplo de claves: no se carga por la aplicación y no contiene secretos. `appsettings.json` tampoco contiene valores utilizables.

### Claves de configuración

| Clave lógica | Equivalente de variable de entorno |
| --- | --- |
| `Jwt:Key` | `Jwt__Key` |
| `ConnectionStrings:RestaurantSystem` | `ConnectionStrings__RestaurantSystem` |

En Development, prefiera User Secrets. Las variables de entorno son una alternativa para procesos automatizados o entornos que las administren; no las establezca manualmente en la sesión para el flujo local normal.

## Ejecutar y comprobar

```powershell
dotnet restore RestaurantSystem.slnx
dotnet build RestaurantSystem.slnx
dotnet run --project src/RestaurantSystem.Api
```

No es necesario establecer manualmente `ASPNETCORE_ENVIRONMENT` para la ejecución normal: el perfil de lanzamiento inicia en `Development` y escucha en `http://localhost:5057`.

En Development, compruebe:

- `http://localhost:5057/health`
- `http://localhost:5057/swagger`
- `http://localhost:5057/openapi/v1.json`

En Production, `/swagger` y `/openapi/v1.json` permanecen sin exponer y devuelven `404`.

## Tests

```powershell
dotnet test RestaurantSystem.slnx --no-build
```
