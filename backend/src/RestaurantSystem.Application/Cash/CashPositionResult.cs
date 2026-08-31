namespace RestaurantSystem.Application.Cash;

public sealed record CashPositionResult(
    Guid CashSessionId,
    DateOnly BusinessDate,
    decimal OpeningAmount,
    decimal PettyCashOpeningAmount,
    decimal CashRemovedAmount,
    decimal? CashAmountCarriedForward,
    decimal SalesTotal,
    decimal CashSalesTotal,
    decimal QrSalesTotal,
    decimal ExternalSalesTotal,
    decimal DirectSalesTotal,
    decimal PedidosYaSalesTotal,
    decimal CashDrawerExpensesTotal,
    decimal PettyCashExpensesTotal,
    decimal ExpensesTotal,
    decimal ExpectedCash);
