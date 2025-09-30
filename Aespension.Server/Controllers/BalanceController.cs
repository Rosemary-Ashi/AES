using Aespension.Data;
using Aespension.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aespension.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class BalanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public BalanceController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{pin?}")]
    public async Task<ActionResult<IEnumerable<BalanceModel>>> GetBalance(string pin = null, [FromQuery] DateTime? endDate = null)
    {
        var userPin = User.Claims.FirstOrDefault(c => c.Type == "pin")?.Value;

        if (userPin != pin)
            return Forbid("You are not allowed to access this resource.");
        try
        {
            var effectiveDate = endDate?.ToString("yyyy-MM-dd") ?? "2025-06-30";
            var query = $"EXEC [dbo].[proc_GetAesMemberBalance] @pin = {(pin != null ? $"'{pin}'" : "NULL")}, @endDate = '{effectiveDate}'";
            var balances = await _context.Balances.FromSqlRaw(query).ToListAsync();
            return Ok(balances);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"An error occurred: {ex.Message}" });
        }
    }
}