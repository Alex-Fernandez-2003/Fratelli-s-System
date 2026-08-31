using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Expenses;

public sealed record ExpenseCategoryDto(Guid Id, string Name);
public sealed record CreateExpenseRequest(Guid? ExpenseCategoryId, decimal Amount, CashSource CashSource, string Description, DateOnly ExpenseDate);
public sealed record ExpenseDto(Guid Id, Guid? ExpenseCategoryId, string? ExpenseCategoryName, decimal Amount, CashSource CashSource, string Description, DateOnly ExpenseDate, DateTimeOffset CreatedAt, string CreatedByUserId, string? CreatedByDisplayName);
public sealed record ExpenseHistoryDto(Guid Id, DateOnly ExpenseDate, DateOnly? BusinessDate, string Description, Guid? ExpenseCategoryId, string? ExpenseCategoryName, CashSource CashSource, decimal Amount, string CreatedByUserId, string? ResponsibleDisplayName, Guid? ShiftId, ShiftType? ShiftType);
public sealed record ExpenseHistoryPage(IReadOnlyList<ExpenseHistoryDto> Items, int Page, int PageSize, int TotalCount, int TotalPages, decimal TotalAmount, decimal CashDrawerTotal, decimal PettyCashTotal);
public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseCategoryDto>> CategoriesAsync(CancellationToken ct = default);
    Task<(ExpenseDto? Value, string? Error)> CreateAsync(CreateExpenseRequest request, string actorUserId, CancellationToken ct = default);
    Task<ExpenseHistoryPage> HistoryAsync(int page, int pageSize, DateOnly? from, DateOnly? to, Guid? categoryId, CashSource? cashSource, string? responsible, Guid? shiftId, ShiftType? shiftType, CancellationToken ct = default);
}
