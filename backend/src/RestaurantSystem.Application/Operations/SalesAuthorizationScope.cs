using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Operations;

public sealed record AuthorizedSalesScope(bool IsAuthorized, Guid? ShiftId)
{
    public bool IsBroad => IsAuthorized && ShiftId is null;

    public IQueryable<Sale> Apply(IQueryable<Sale> sales) =>
        !IsAuthorized ? sales.Where(_ => false) :
        ShiftId is { } shiftId ? sales.Where(sale => sale.ShiftId == shiftId) : sales;
}

public interface ISalesAuthorizationScope
{
    Task<AuthorizedSalesScope> ResolveAsync(string actor, IReadOnlySet<string> roles, CancellationToken ct = default);
}
