using RestaurantSystem.Domain.Catalog;

namespace RestaurantSystem.Infrastructure.Catalog;

internal static class CatalogSeeds
{
    internal static readonly Category[] Categories =
    [
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Name = "Entradas", Scope = CategoryScope.MENU, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Name = "Platos principales", Scope = CategoryScope.MENU, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Name = "Acompañamientos", Scope = CategoryScope.MENU, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Name = "Postres", Scope = CategoryScope.MENU, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Name = "Bebidas", Scope = CategoryScope.MENU, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), Name = "Perecederos", Scope = CategoryScope.INVENTORY, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000007"), Name = "No perecederos", Scope = CategoryScope.INVENTORY, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000008"), Name = "Bebidas e Insumos", Scope = CategoryScope.INVENTORY, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000009"), Name = "Suministros y Limpieza", Scope = CategoryScope.INVENTORY, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000010"), Name = "Salsas", Scope = CategoryScope.PREPARATION, IsActive = true },
        new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000011"), Name = "Masas y pastas", Scope = CategoryScope.PREPARATION, IsActive = true }
    ];

    internal static readonly Unit[] Units =
    [
        new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), Code = "g", Name = "Gramo", Symbol = "g", Dimension = UnitDimension.MASS, FactorToBase = 1m, IsBase = true, IsActive = true },
        new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), Code = "kg", Name = "Kilogramo", Symbol = "kg", Dimension = UnitDimension.MASS, FactorToBase = 1000m, IsBase = false, IsActive = true },
        new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000003"), Code = "ml", Name = "Mililitro", Symbol = "ml", Dimension = UnitDimension.VOLUME, FactorToBase = 1m, IsBase = true, IsActive = true },
        new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000004"), Code = "l", Name = "Litro", Symbol = "l", Dimension = UnitDimension.VOLUME, FactorToBase = 1000m, IsBase = false, IsActive = true },
        new() { Id = Guid.Parse("20000000-0000-0000-0000-000000000005"), Code = "unit", Name = "Unidad", Symbol = "u", Dimension = UnitDimension.COUNT, FactorToBase = 1m, IsBase = true, IsActive = true }
    ];
}
