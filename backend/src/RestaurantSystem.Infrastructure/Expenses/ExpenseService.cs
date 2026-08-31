using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.Infrastructure.Expenses;

public sealed class ExpenseService(ApplicationDbContext db, IBusinessClock clock) : IExpenseService
{
    public async Task<IReadOnlyList<ExpenseCategoryDto>> CategoriesAsync(CancellationToken ct = default) =>
        await db.ExpenseCategories.AsNoTracking().Where(x => x.IsActive).OrderBy(x => x.Name).ThenBy(x => x.Id).Select(x => new ExpenseCategoryDto(x.Id, x.Name)).ToArrayAsync(ct);

    public async Task<ExpenseHistoryPage> HistoryAsync(int page, int pageSize, DateOnly? from, DateOnly? to, Guid? categoryId, CashSource? cashSource, string? responsible, Guid? shiftId, ShiftType? shiftType, CancellationToken ct = default)
    {
        var query =
            from expense in db.Expenses.AsNoTracking()
            join category in db.ExpenseCategories.AsNoTracking() on expense.ExpenseCategoryId equals (Guid?)category.Id into categories
            from category in categories.DefaultIfEmpty()
            join shift in db.Shifts.AsNoTracking() on expense.ShiftId equals (Guid?)shift.Id into shifts
            from shift in shifts.DefaultIfEmpty()
            join session in db.CashSessions.AsNoTracking() on shift.CashSessionId equals (Guid?)session.Id into sessions
            from session in sessions.DefaultIfEmpty()
            join user in db.Users.AsNoTracking() on expense.CreatedByUserId equals user.Id
            join employee in db.Employees.AsNoTracking() on expense.CreatedByUserId equals employee.UserId into employees
            from employee in employees.DefaultIfEmpty()
            select new { expense, category, shift, session, Responsible = employee.FullName ?? user.UserName };

        if (from is not null) query = query.Where(x => x.expense.ExpenseDate >= from);
        if (to is not null) query = query.Where(x => x.expense.ExpenseDate <= to);
        if (categoryId is not null) query = query.Where(x => x.expense.ExpenseCategoryId == categoryId);
        if (cashSource is not null) query = query.Where(x => x.expense.CashSource == cashSource);
        if (shiftId is not null) query = query.Where(x => x.expense.ShiftId == shiftId);
        if (shiftType is not null) query = query.Where(x => x.shift != null && x.shift.Type == shiftType);
        if (!string.IsNullOrWhiteSpace(responsible))
        {
            var pattern = $"%{responsible.Trim()}%";
            query = query.Where(x => EF.Functions.ILike(x.Responsible ?? string.Empty, pattern));
        }

        var totalCount = await query.CountAsync(ct);
        var totalAmount = await query.SumAsync(x => (decimal?)x.expense.Amount, ct) ?? 0m;
        var cashDrawerTotal = await query.Where(x => x.expense.CashSource == CashSource.CASH_DRAWER).SumAsync(x => (decimal?)x.expense.Amount, ct) ?? 0m;
        var pettyCashTotal = await query.Where(x => x.expense.CashSource == CashSource.PETTY_CASH).SumAsync(x => (decimal?)x.expense.Amount, ct) ?? 0m;
        var items = await query.OrderByDescending(x => x.expense.ExpenseDate).ThenByDescending(x => x.expense.CreatedAt).ThenByDescending(x => x.expense.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new ExpenseHistoryDto(x.expense.Id, x.expense.ExpenseDate, x.session == null ? null : x.session.BusinessDate, x.expense.Description, x.expense.ExpenseCategoryId, x.category == null ? null : x.category.Name, x.expense.CashSource, x.expense.Amount, x.expense.CreatedByUserId, x.Responsible, x.expense.ShiftId, x.shift == null ? null : x.shift.Type))
            .ToArrayAsync(ct);
        return new(items, page, pageSize, totalCount, (int)Math.Ceiling(totalCount / (double)pageSize), totalAmount, cashDrawerTotal, pettyCashTotal);
    }

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
