using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aespension.Data;
using Aespension.Models;
using Microsoft.AspNetCore.Authorization;

namespace Aespension.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class StatementController : ControllerBase
{
    private readonly AppDbContext _context;

    public StatementController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{pin}")]
    public async Task<ActionResult<IEnumerable<StatementModel>>> GetStatement(
        string pin, 
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        var userPin = User.Claims.FirstOrDefault(c => c.Type == "pin")?.Value;

        if (userPin != pin)
            return Forbid("You are not allowed to access this resource.");
        try
        {
            var query = $"EXEC [dbo].[proc_GetAesMemberStatement] @pin = '{pin}', @startDate = '{startDate:yyyy-MM-dd}', @endDate = '{endDate:yyyy-MM-dd}'";
            var statements = await _context.Statements.FromSqlRaw(query).ToListAsync();
            return Ok(statements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"An error occurred: {ex.Message}" });
        }
    }
}