using System.Text.Json.Serialization;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Production;

namespace RestaurantSystem.Application.Production;

public sealed record RecipeDto(
    Guid Id,
    string Name,
    Guid ProductId,
    string ProductName,
    ProductType ProductType,
    decimal YieldQuantity,
    Guid YieldUnitId,
    string YieldUnitCode,
    string? Instructions,
    bool IsActive,
    DateTimeOffset CreatedAt,
    string CreatedByUserId,
    DateTimeOffset UpdatedAt,
    string UpdatedByUserId,
    IReadOnlyList<RecipeIngredientDto> Ingredients
);

public sealed record RecipeIngredientDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal Quantity,
    Guid UnitId,
    string UnitCode,
    int SortOrder
);

public sealed record RecipeRequest(
    string Name,
    Guid ProductId,
    decimal YieldQuantity,
    Guid YieldUnitId,
    string? Instructions,
    IReadOnlyList<RecipeIngredientRequest> Ingredients
);

public sealed record RecipeIngredientRequest(
    Guid ProductId,
    decimal Quantity,
    Guid UnitId,
    int SortOrder
);

public sealed record ProductionBatchDto(
    Guid Id,
    string BatchNumber,
    Guid RecipeId,
    string RecipeName,
    Guid ProductId,
    string ProductName,
    decimal PlannedQuantity,
    decimal ActualQuantity,
    Guid UnitId,
    string UnitCode,
    ProductionBatchStatus Status,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    string? Notes,
    string CreatedByUserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string UpdatedByUserId,
    IReadOnlyList<ProductionBatchIngredientDto> ConsumedIngredients
);

public sealed record ProductionBatchIngredientDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal PlannedQuantity,
    decimal ActualQuantity,
    Guid UnitId,
    string UnitCode
);

public sealed record RegisterProductionRequest(
    Guid RecipeId,
    decimal Quantity,
    string? Notes
);

public sealed record RegisterProductionResponse(
    Guid BatchId,
    string BatchNumber,
    ProductionBatchStatus Status
);

public interface IRecipeService
{
    Task<PagedResponse<RecipeDto>> GetRecipes(int page, int pageSize, string? search, bool? isActive, CancellationToken ct);
    Task<RecipeDto?> GetRecipe(Guid id, CancellationToken ct);
    Task<(RecipeDto? Value, string? Error)> CreateRecipe(RecipeRequest request, string actor, CancellationToken ct);
    Task<(RecipeDto? Value, string? Error)> UpdateRecipe(Guid id, RecipeRequest request, string actor, CancellationToken ct);
    Task<string?> DeleteRecipe(Guid id, CancellationToken ct);
}

public interface IProductionService
{
    Task<PagedResponse<ProductionBatchDto>> GetProductionBatches(int page, int pageSize, ProductionBatchStatus? status, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct);
    Task<ProductionBatchDto?> GetProductionBatch(Guid id, CancellationToken ct);
    Task<(RegisterProductionResponse? Value, string? Error)> RegisterProduction(RegisterProductionRequest request, string actor, CancellationToken ct);
    Task<(ProductionBatchDto? Value, string? Error)> CompleteProduction(Guid id, decimal actualQuantity, string actor, CancellationToken ct);
    Task<string?> CancelProduction(Guid id, string actor, CancellationToken ct);
}