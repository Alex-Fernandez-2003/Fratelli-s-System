namespace RestaurantSystem.Domain.Catalog;

public enum CategoryScope { MENU, INVENTORY, PREPARATION }
public enum UnitDimension { MASS, VOLUME, COUNT }
public enum ProductType { INGREDIENT, PREPARATION, SALE_ITEM, SUPPLY }

public sealed class Category { public Guid Id { get; set; } = Guid.NewGuid(); public required string Name { get; set; } public CategoryScope Scope { get; set; } public bool IsActive { get; set; } = true; }
public sealed class Unit { public Guid Id { get; set; } = Guid.NewGuid(); public required string Code { get; set; } public required string Name { get; set; } public required string Symbol { get; set; } public UnitDimension Dimension { get; set; } public decimal FactorToBase { get; set; } public bool IsBase { get; set; } public bool IsActive { get; set; } = true; }
public sealed class Product { public Guid Id { get; set; } = Guid.NewGuid(); public required string Name { get; set; } public ProductType ProductType { get; set; } public Guid? CategoryId { get; set; } public Category? Category { get; set; } public Guid InventoryUnitId { get; set; } public Unit? InventoryUnit { get; set; } public string? PreparationArea { get; set; } public decimal? SalePrice { get; set; } public decimal? MinStock { get; set; } public bool IsActive { get; set; } = true; public DateTimeOffset CreatedAt { get; set; } public required string CreatedByUserId { get; set; } public DateTimeOffset UpdatedAt { get; set; } public required string UpdatedByUserId { get; set; } }
