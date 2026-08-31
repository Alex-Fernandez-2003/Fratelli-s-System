namespace RestaurantSystem.Application.Cash;

public interface ICashPositionCalculator
{
    Task<CashPositionResult> CalculateAsync(Guid cashSessionId, CancellationToken ct = default);
}
