using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Production;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Production;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.Infrastructure.Production;

public sealed class ProductionService(ApplicationDbContext db) : IProductionService, IRecipeService
{
    static readonly Random Rng = new();

    static RecipeDto MapRecipe(Recipe r) => new(
        r.Id, r.Name, r.ProductId, r.Product?.Name ?? "", r.Product?.ProductType ?? ProductType.PREPARATION,
        r.YieldQuantity, r.YieldUnitId, r.YieldUnit?.Code ?? "", r.Instructions, r.IsActive,
        r.CreatedAt, r.CreatedByUserId, r.UpdatedAt, r.UpdatedByUserId,
        r.Ingredients.Select(MapIngredient).ToList()
    );

    static RecipeIngredientDto MapIngredient(RecipeIngredient i) => new(
        i.Id, i.ProductId, i.Product?.Name ?? "", i.Quantity, i.UnitId, i.Unit?.Code ?? "", i.SortOrder
    );

    static ProductionBatchDto MapBatch(ProductionBatch b) => new(
        b.Id, b.BatchNumber, b.RecipeId, b.Recipe?.Name ?? "", b.ProductId, b.Product?.Name ?? "",
        b.PlannedQuantity, b.ActualQuantity, b.UnitId, b.Unit?.Code ?? "", b.Status,
        b.StartedAt, b.CompletedAt, b.Notes, b.CreatedByUserId, b.CreatedAt, b.UpdatedAt, b.UpdatedByUserId,
        b.ConsumedIngredients.Select(MapBatchIngredient).ToList()
    );

    static ProductionBatchIngredientDto MapBatchIngredient(ProductionBatchIngredient i) => new(
        i.Id, i.ProductId, i.Product?.Name ?? "", i.PlannedQuantity, i.ActualQuantity, i.UnitId, i.Unit?.Code ?? ""
    );

    static async Task<PagedResponse<T>> Page<T>(IQueryable<T> q, int page, int size, CancellationToken ct)
    {
        var count = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync(ct);
        return new(items, page, size, count, (int)Math.Ceiling(count / (double)size));
    }

    public async Task<PagedResponse<RecipeDto>> GetRecipes(int page, int pageSize, string? search, bool? isActive, CancellationToken ct)
    {
        var q = db.Recipes.AsNoTracking()
            .Include(x => x.Product).ThenInclude(p => p.InventoryUnit)
            .Include(x => x.YieldUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Product).ThenInclude(i => i.InventoryUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Unit)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(x => x.Name.ToLower().Contains(search.ToLower()));
        if (isActive is not null) q = q.Where(x => x.IsActive == isActive);
        return await Page(q.OrderBy(x => x.Name).Select(x => MapRecipe(x)), page, pageSize, ct);
    }

    public async Task<RecipeDto?> GetRecipe(Guid id, CancellationToken ct)
    {
        var r = await db.Recipes
            .Include(x => x.Product).ThenInclude(p => p.InventoryUnit)
            .Include(x => x.YieldUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Product).ThenInclude(i => i.InventoryUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Unit)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        return r is null ? null : MapRecipe(r);
    }

    public async Task<(RecipeDto? Value, string? Error)> CreateRecipe(RecipeRequest request, string actor, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return (null, "Invalid recipe name");
        if (request.YieldQuantity <= 0) return (null, "Invalid yield quantity");
        if (!await db.Products.AnyAsync(x => x.Id == request.ProductId && x.IsActive, ct)) return (null, "Product not found");
        if (!await db.Units.AnyAsync(x => x.Id == request.YieldUnitId && x.IsActive, ct)) return (null, "Yield unit not found");
        if (await db.Recipes.AnyAsync(x => x.ProductId == request.ProductId, ct)) return (null, "Recipe already exists for this product");

        foreach (var ing in request.Ingredients)
        {
            if (!await db.Products.AnyAsync(x => x.Id == ing.ProductId && x.IsActive, ct)) return (null, $"Ingredient product {ing.ProductId} not found");
            if (!await db.Units.AnyAsync(x => x.Id == ing.UnitId && x.IsActive, ct)) return (null, $"Ingredient unit {ing.UnitId} not found");
        }

        var now = DateTimeOffset.UtcNow;
        var recipe = new Recipe
        {
            Name = request.Name.Trim(),
            ProductId = request.ProductId,
            YieldQuantity = request.YieldQuantity,
            YieldUnitId = request.YieldUnitId,
            Instructions = request.Instructions?.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByUserId = actor,
            UpdatedByUserId = actor,
            Ingredients = request.Ingredients.Select((i, idx) => new RecipeIngredient
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitId = i.UnitId,
                SortOrder = i.SortOrder
            }).ToList()
        };

        db.Recipes.Add(recipe);
        await db.SaveChangesAsync(ct);
        return (await GetRecipe(recipe.Id, ct), null);
    }

    public async Task<(RecipeDto? Value, string? Error)> UpdateRecipe(Guid id, RecipeRequest request, string actor, CancellationToken ct)
    {
        var recipe = await db.Recipes.Include(x => x.Ingredients).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (recipe is null) return (null, "Not found");
        if (string.IsNullOrWhiteSpace(request.Name)) return (null, "Invalid recipe name");
        if (request.YieldQuantity <= 0) return (null, "Invalid yield quantity");
        if (!await db.Products.AnyAsync(x => x.Id == request.ProductId && x.IsActive, ct)) return (null, "Product not found");
        if (!await db.Units.AnyAsync(x => x.Id == request.YieldUnitId && x.IsActive, ct)) return (null, "Yield unit not found");

        foreach (var ing in request.Ingredients)
        {
            if (!await db.Products.AnyAsync(x => x.Id == ing.ProductId && x.IsActive, ct)) return (null, $"Ingredient product {ing.ProductId} not found");
            if (!await db.Units.AnyAsync(x => x.Id == ing.UnitId && x.IsActive, ct)) return (null, $"Ingredient unit {ing.UnitId} not found");
        }

        recipe.Name = request.Name.Trim();
        recipe.ProductId = request.ProductId;
        recipe.YieldQuantity = request.YieldQuantity;
        recipe.YieldUnitId = request.YieldUnitId;
        recipe.Instructions = request.Instructions?.Trim();
        recipe.UpdatedAt = DateTimeOffset.UtcNow;
        recipe.UpdatedByUserId = actor;

        db.RecipeIngredients.RemoveRange(recipe.Ingredients);
        recipe.Ingredients = request.Ingredients.Select((i, idx) => new RecipeIngredient
        {
            ProductId = i.ProductId,
            Quantity = i.Quantity,
            UnitId = i.UnitId,
            SortOrder = i.SortOrder
        }).ToList();

        await db.SaveChangesAsync(ct);
        return (await GetRecipe(id, ct), null);
    }

    public async Task<string?> DeleteRecipe(Guid id, CancellationToken ct)
    {
        var recipe = await db.Recipes.FindAsync(new object[] { id }, ct);
        if (recipe is null) return "Not found";
        if (await db.ProductionBatches.AnyAsync(x => x.RecipeId == id, ct)) return "Recipe is in use by production batches";
        recipe.IsActive = false;
        recipe.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return null;
    }

    public async Task<PagedResponse<ProductionBatchDto>> GetProductionBatches(int page, int pageSize, ProductionBatchStatus? status, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct)
    {
        var q = db.ProductionBatches
            .AsNoTracking()
            .Include(x => x.Recipe).Include(x => x.Product).ThenInclude(p => p.InventoryUnit).Include(x => x.Unit)
            .Include(x => x.ConsumedIngredients).ThenInclude(i => i.Product).ThenInclude(i => i.InventoryUnit)
            .Include(x => x.ConsumedIngredients).ThenInclude(i => i.Unit)
            .AsQueryable();

        if (status is not null) q = q.Where(x => x.Status == status);
        if (from is not null) q = q.Where(x => x.CreatedAt >= from);
        if (to is not null) q = q.Where(x => x.CreatedAt <= to);

        return await Page(q.OrderByDescending(x => x.CreatedAt).Select(x => MapBatch(x)), page, pageSize, ct);
    }

    public async Task<ProductionBatchDto?> GetProductionBatch(Guid id, CancellationToken ct)
    {
        var b = await db.ProductionBatches
            .Include(x => x.Recipe).Include(x => x.Product).ThenInclude(p => p.InventoryUnit).Include(x => x.Unit)
            .Include(x => x.ConsumedIngredients).ThenInclude(i => i.Product).ThenInclude(i => i.InventoryUnit)
            .Include(x => x.ConsumedIngredients).ThenInclude(i => i.Unit)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        return b is null ? null : MapBatch(b);
    }

    public async Task<(RegisterProductionResponse? Value, string? Error)> RegisterProduction(RegisterProductionRequest request, string actor, CancellationToken ct)
    {
        var recipe = await db.Recipes
            .Include(x => x.Product)
            .Include(x => x.YieldUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Product).ThenInclude(i => i.InventoryUnit)
            .Include(x => x.Ingredients).ThenInclude(i => i.Unit)
            .SingleOrDefaultAsync(x => x.Id == request.RecipeId && x.IsActive, ct);

        if (recipe is null) return (null, "Recipe not found or inactive");
        if (request.Quantity <= 0) return (null, "Invalid quantity");

        var factor = recipe.YieldQuantity > 0 ? request.Quantity / recipe.YieldQuantity : 0;

        var now = DateTimeOffset.UtcNow;
        var batchNumber = $"PROD-{now:yyyyMMdd}-{Rng.Next(1000, 9999)}";

        var batch = new ProductionBatch
        {
            BatchNumber = batchNumber,
            RecipeId = recipe.Id,
            ProductId = recipe.ProductId,
            PlannedQuantity = request.Quantity,
            ActualQuantity = 0,
            UnitId = recipe.YieldUnitId,
            Status = ProductionBatchStatus.InProgress,
            StartedAt = now,
            Notes = request.Notes?.Trim(),
            CreatedByUserId = actor,
            CreatedAt = now,
            UpdatedAt = now,
            UpdatedByUserId = actor,
            ConsumedIngredients = recipe.Ingredients.Select(i => new ProductionBatchIngredient
            {
                ProductId = i.ProductId,
                PlannedQuantity = i.Quantity * factor,
                ActualQuantity = 0,
                UnitId = i.UnitId
            }).ToList()
        };

        db.ProductionBatches.Add(batch);
        await db.SaveChangesAsync(ct);

        return (new RegisterProductionResponse(batch.Id, batch.BatchNumber, batch.Status), null);
    }

    public async Task<(ProductionBatchDto? Value, string? Error)> CompleteProduction(Guid id, decimal actualQuantity, string actor, CancellationToken ct)
    {
        var batch = await db.ProductionBatches
            .Include(x => x.Recipe).ThenInclude(r => r.Ingredients)
            .Include(x => x.ConsumedIngredients).ThenInclude(i => i.Product)
            .SingleOrDefaultAsync(x => x.Id == id, ct);

        if (batch is null) return (null, "Production batch not found");
        if (batch.Status != ProductionBatchStatus.InProgress) return (null, "Batch is not in progress");
        if (actualQuantity <= 0) return (null, "Invalid actual quantity");

        batch.ActualQuantity = actualQuantity;
        batch.Status = ProductionBatchStatus.Completed;
        batch.CompletedAt = DateTimeOffset.UtcNow;
        batch.UpdatedAt = DateTimeOffset.UtcNow;
        batch.UpdatedByUserId = actor;

        var factor = batch.PlannedQuantity > 0 ? actualQuantity / batch.PlannedQuantity : 1;

        foreach (var consumed in batch.ConsumedIngredients)
        {
            consumed.ActualQuantity = consumed.PlannedQuantity * factor;
            var product = await db.Products.FindAsync(new object[] { consumed.ProductId }, ct);
            if (product is not null)
            {
                // Note: In a real system, you'd have inventory/stock management here
                // For now we just record the consumption
            }
        }

        await db.SaveChangesAsync(ct);
        return (await GetProductionBatch(id, ct), null);
    }

    public async Task<string?> CancelProduction(Guid id, string actor, CancellationToken ct)
    {
        var batch = await db.ProductionBatches.FindAsync(new object[] { id }, ct);
        if (batch is null) return "Not found";
        if (batch.Status == ProductionBatchStatus.Completed) return "Cannot cancel completed batch";
        batch.Status = ProductionBatchStatus.Cancelled;
        batch.UpdatedAt = DateTimeOffset.UtcNow;
        batch.UpdatedByUserId = actor;
        await db.SaveChangesAsync(ct);
        return null;
    }
}