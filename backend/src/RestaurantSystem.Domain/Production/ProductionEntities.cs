using RestaurantSystem.Domain.Catalog;

namespace RestaurantSystem.Domain.Production;

public sealed class Recipe
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal YieldQuantity { get; set; }
    public Guid YieldUnitId { get; set; }
    public Unit? YieldUnit { get; set; }
    public string? Instructions { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public required string UpdatedByUserId { get; set; }
    public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
}

public sealed class RecipeIngredient
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RecipeId { get; set; }
    public Recipe? Recipe { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal Quantity { get; set; }
    public Guid UnitId { get; set; }
    public Unit? Unit { get; set; }
    public int SortOrder { get; set; }
}

public enum ProductionBatchStatus { Pending, InProgress, Completed, Cancelled }

public sealed class ProductionBatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string BatchNumber { get; set; }
    public Guid RecipeId { get; set; }
    public Recipe? Recipe { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public Guid UnitId { get; set; }
    public Unit? Unit { get; set; }
    public ProductionBatchStatus Status { get; set; } = ProductionBatchStatus.Pending;
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public required string UpdatedByUserId { get; set; }
    public ICollection<ProductionBatchIngredient> ConsumedIngredients { get; set; } = new List<ProductionBatchIngredient>();
}

public sealed class ProductionBatchIngredient
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductionBatchId { get; set; }
    public ProductionBatch? ProductionBatch { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public Guid UnitId { get; set; }
    public Unit? Unit { get; set; }
}