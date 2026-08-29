using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantSystem.Application.Production;
using RestaurantSystem.Domain.Production;

namespace RestaurantSystem.Api.Controllers;

[ApiController]
[Route("api/production")]
[Authorize]
public sealed class ProductionController(IProductionService service, IRecipeService recipeService) : ControllerBase
{
    [HttpGet("batches")]
    public async Task<ActionResult<PagedResponse<ProductionBatchDto>>> GetBatches(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ProductionBatchStatus? status = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        CancellationToken ct = default)
    {
        var result = await service.GetProductionBatches(page, pageSize, status, from, to, ct);
        return Ok(result);
    }

    [HttpGet("batches/{id:guid}")]
    public async Task<ActionResult<ProductionBatchDto>> GetBatch(Guid id, CancellationToken ct)
    {
        var batch = await service.GetProductionBatch(id, ct);
        return batch is null ? NotFound() : Ok(batch);
    }

    [HttpPost("batches/register")]
    public async Task<ActionResult<RegisterProductionResponse>> RegisterProduction(
        [FromBody] RegisterProductionRequest request,
        CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "system";
        var result = await service.RegisterProduction(request, actor, ct);
        if (result.Error is not null) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPost("batches/{id:guid}/complete")]
    public async Task<ActionResult<ProductionBatchDto>> CompleteProduction(
        Guid id,
        [FromBody] CompleteProductionRequest request,
        CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "system";
        var result = await service.CompleteProduction(id, request.ActualQuantity, actor, ct);
        if (result.Error is not null) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPost("batches/{id:guid}/cancel")]
    public async Task<ActionResult> CancelProduction(Guid id, CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "system";
        var error = await service.CancelProduction(id, actor, ct);
        return error is null ? Ok() : BadRequest(error);
    }

    [HttpGet("recipes")]
    public async Task<ActionResult<PagedResponse<RecipeDto>>> GetRecipes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        CancellationToken ct = default)
    {
        var result = await recipeService.GetRecipes(page, pageSize, search, isActive, ct);
        return Ok(result);
    }

    [HttpGet("recipes/{id:guid}")]
    public async Task<ActionResult<RecipeDto>> GetRecipe(Guid id, CancellationToken ct)
    {
        var recipe = await recipeService.GetRecipe(id, ct);
        return recipe is null ? NotFound() : Ok(recipe);
    }

    [HttpPost("recipes")]
    public async Task<ActionResult<RecipeDto>> CreateRecipe(
        [FromBody] RecipeRequest request,
        CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "system";
        var result = await recipeService.CreateRecipe(request, actor, ct);
        if (result.Error is not null) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetRecipe), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("recipes/{id:guid}")]
    public async Task<ActionResult<RecipeDto>> UpdateRecipe(
        Guid id,
        [FromBody] RecipeRequest request,
        CancellationToken ct)
    {
        var actor = User.Identity?.Name ?? "system";
        var result = await recipeService.UpdateRecipe(id, request, actor, ct);
        if (result.Error is not null) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpDelete("recipes/{id:guid}")]
    public async Task<ActionResult> DeleteRecipe(Guid id, CancellationToken ct)
    {
        var error = await recipeService.DeleteRecipe(id, ct);
        return error is null ? Ok() : BadRequest(error);
    }
}

public sealed record CompleteProductionRequest(decimal ActualQuantity);