namespace RestaurantSystem.Domain.Expenses;

public enum CashSource { PETTY_CASH, CASH_DRAWER }
public sealed class ExpenseCategory { public Guid Id { get; set; } = Guid.NewGuid(); public required string Name { get; set; } public bool IsActive { get; set; } = true; public DateTimeOffset CreatedAt { get; set; } }
public sealed class Expense { public Guid Id { get; set; } = Guid.NewGuid(); public Guid? ShiftId { get; set; } public Guid? ExpenseCategoryId { get; set; } public decimal Amount { get; set; } public CashSource CashSource { get; set; } public required string Description { get; set; } public DateOnly ExpenseDate { get; set; } public DateTimeOffset CreatedAt { get; set; } public required string CreatedByUserId { get; set; } }
