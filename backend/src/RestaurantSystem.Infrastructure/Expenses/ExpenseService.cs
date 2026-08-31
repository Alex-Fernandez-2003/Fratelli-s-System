using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.Infrastructure.Expenses;

public sealed class ExpenseService(ApplicationDbContext db, IBusinessClock clock) : IExpenseService
{
    public async Task<IReadOnlyList<ExpenseCategoryDto>> CategoriesAsync(CancellationToken ct = default) =>
        await db.ExpenseCategories.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name).ThenBy(x => x.Id).Select(x => new ExpenseCategoryDto(x.Id, x.Name)).ToArrayAsync(ct);

    public async Task<(ExpenseDto? Value, string? Error)> CreateAsync(CreateExpenseRequest request, string actorUserId, CancellationToken ct = default)
    {
        if (request.Amount <= 0 || !Enum.IsDefined(request.CashSource) || string.IsNullOrWhiteSpace(request.Description) || request.Description.Trim().Length > 500 || request.ExpenseDate > clock.BusinessDate)
            return (null, "INVALID_REQUEST");
        ExpenseCategory? category = null;
        if (request.ExpenseCategoryId is not null)
        {
            category = await db.ExpenseCategories.SingleOrDefaultAsync(x => x.Id == request.ExpenseCategoryId, ct);
            if (category is null) return (null, "NOT_FOUND");
            if (!category.IsActive) return (null, "EXPENSE_CATEGORY_INACTIVE");
        }
        var shiftId = (await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: false, forUpdate: false, ct))?.Id;
        var expense = new Expense { ShiftId = shiftId, ExpenseCategoryId = request.ExpenseCategoryId, Amount = request.Amount, CashSource = request.CashSource, Description = request.Description.Trim(), ExpenseDate = request.ExpenseDate, CreatedAt = clock.UtcNow, CreatedByUserId = actorUserId };
        db.Expenses.Add(expense); await db.SaveChangesAsync(ct);
        var displayName = await db.Employees.AsNoTracking().Where(x => x.UserId == actorUserId).Select(x => x.FullName).FirstOrDefaultAsync(ct) ?? await db.Users.Where(x => x.Id == actorUserId).Select(x => x.UserName).FirstOrDefaultAsync(ct);
        return (new(expense.Id, expense.ExpenseCategoryId, category?.Name, expense.Amount, expense.CashSource, expense.Description, expense.ExpenseDate, expense.CreatedAt, expense.CreatedByUserId, displayName), null);
    }
}
