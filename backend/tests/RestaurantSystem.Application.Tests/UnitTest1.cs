using RestaurantSystem.Application.Auth;

namespace RestaurantSystem.Application.Tests;
public sealed class AuthContractTests
{
    [Fact]
    public void Auth_user_preserves_nullable_employee_data_and_roles()
    {
        var user = new AuthUser("string-key", "admin.test", null, null, ["ADMINISTRADOR", "EMPLEADO"]);
        Assert.Equal("string-key", user.Id);
        Assert.Null(user.FullName);
        Assert.Equal(["ADMINISTRADOR", "EMPLEADO"], user.Roles);
    }
}
