using RestaurantSystem.Domain.Expenses;

namespace RestaurantSystem.Application.Expenses;

public sealed record ExpenseCategoryDto(Guid Id, string Name);
public sealed record CreateExpenseRequest(Guid? ExpenseCategoryId, decimal Amount, CashSource CashSource, string Description, DateOnly ExpenseDate);
public sealed record ExpenseDto(Guid Id, Guid? ExpenseCategoryId, string? ExpenseCategoryName, decimal Amount, CashSource CashSource, string Description, DateOnly ExpenseDate, DateTimeOffset CreatedAt, string CreatedByUserId, string? CreatedByDisplayName);
public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseCategoryDto>> CategoriesAsync(CancellationToken ct = default);
    Task<(ExpenseDto? Value, string? Error)> CreateAsync(CreateExpenseRequest request, string actorUserId, CancellationToken ct = default);
}
