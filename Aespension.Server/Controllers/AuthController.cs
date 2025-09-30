using Aespension.Data;
using Aespension.Models;
using Aespension.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
namespace Aespension.Controllers;

using Aespension.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly IEmailTemplateService _emailTemplateService;

    public AuthController(AppDbContext context, IEmailService emailService, IConfiguration configuration, IEmailTemplateService emailTemplateService)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _emailTemplateService = emailTemplateService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PIN) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { Message = "PIN and Password are required." });
        }

        var user = await _context.Users
            .Where(u => u.PIN == request.PIN)
            .SingleOrDefaultAsync();

        if (user == null)
        {
            return Unauthorized(new { Message = "Invalid PIN or Password." });
        }

        if (!user.IsActive)
        {
            return BadRequest(new { Message = "Your account is inactive. Contact admin." });
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.Now)
        {
            return Unauthorized(new { Message = "Account is locked. Please reset your password." });
        }

        //Check password
        //bool isPasswordValid = VerifyPassword(request.Password, user.PasswordHash);
        var decryptedPassword = DecryptPassword(request.Password, request.IV);
        bool isPasswordValid = VerifyPassword(decryptedPassword, user.PasswordHash);

        if (!isPasswordValid)
        {
            user.FailedLoginAttempts += 1;

            if (user.FailedLoginAttempts >= 3)
            {
                user.LockoutEnd = DateTime.Now.AddMinutes(15); // lock for 15 mins
            }

            await _context.SaveChangesAsync();
            return Unauthorized(new { Message = "Invalid PIN or Password." });
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        user.LastLoginAt = DateTime.Now;
        await _context.SaveChangesAsync();
        //Generate JWT
        var token = GenerateJwtToken(user);
        var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]);
        var expires = DateTime.Now.AddMinutes(expireMinutes);

        return Ok(new
        {
            Token = token,
            expiry = expires,
            Pin = user.PIN,
        });
    }


    [HttpPost("get-access")]
    public async Task<ActionResult<RegisterResponse>> GetAccess([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.PIN) &&
                string.IsNullOrWhiteSpace(request.Email) &&
                string.IsNullOrWhiteSpace(request.Mobile_Phone))
            {
                return BadRequest(new RegisterResponse
                {
                    Message = "At least one of PIN, email, or phone number must be provided.",
                    Success = false
                });
            }

            var employee = await _context.Employees
                .Where(e =>
                    e.Scheme_Id == 11 &&
                    (
                        (!string.IsNullOrEmpty(request.PIN) && e.PIN == request.PIN) ||
                        (!string.IsNullOrEmpty(request.Email) && e.Email == request.Email) ||
                        (!string.IsNullOrEmpty(request.Mobile_Phone) && e.Mobile_Phone == request.Mobile_Phone)
                    )
                )
                .SingleOrDefaultAsync();

            if (employee == null)
            {
                return BadRequest(new RegisterResponse
                {
                    Message = "Invalid PIN, email, or phone number or Fund Type.",
                    Success = false
                });
            }

            //Check if user already exists
            var existingUser = await _context.Users
                .SingleOrDefaultAsync(u => u.PIN == employee.PIN);

            if (existingUser != null)
            {
                return Ok(new RegisterResponse
                {
                    Success = false,
                    Message = "Your account has already been registered. Please use the Forgot Password option on the login page if you need to reset your password."
                });
            }

            //New user flow
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var encodedToken = Uri.EscapeDataString(resetToken);
            var resetTokenExpiry = DateTime.Now.AddHours(24);

            var resetLink = $"{_configuration["FrontendUrl"]}/reset-password?token={encodedToken}";

            var tempPassword = GenerateTempPassword(employee.Firstname, employee.Surname);
            var hashedPassword = HashPassword(tempPassword);

            var newUser = new UserModel
            {
                PIN = employee.PIN,
                Email = employee.Email,
                PhoneNumber = request.Mobile_Phone,
                ResetToken = resetToken,
                ResetTokenExpiry = resetTokenExpiry,
                CreatedAt = DateTime.Now,
                PasswordHash = hashedPassword
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var body = _emailTemplateService.BuildPasswordResetEmail(employee.Firstname, employee.Surname, resetLink);

            if (!string.IsNullOrEmpty(employee.Email))
            {
                var userName = $"{employee.Firstname} {employee.Surname}".Trim();
                await _emailService.SendPasswordResetEmailAsync(employee.Email, $"{employee.Firstname} {employee.Surname}", body);
            }

            return Ok(new RegisterResponse
            {
                Success = true,
                Message = "User registered successfully. Check your email for the password reset link."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new RegisterResponse
            {
                Message = $"An error occurred: {ex.Message}",
                Success = false
            });
        }
    }

    [HttpPost("Forgot-password")]
    public async Task<ActionResult<RegisterResponse>> ConfirmReset([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PIN) && string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new RegisterResponse
            {
                Message = "Enter PIN or Email Address",
                Success = false
            });
        }

        try
        {
            //Checks if user exists in Aesusers (already registered)
            var registeredUser = await _context.Users
                .Where(u =>
                    (!string.IsNullOrEmpty(request.PIN) && u.PIN == request.PIN) ||
                    (!string.IsNullOrEmpty(request.Email) && u.Email == request.Email)
                )
                .SingleOrDefaultAsync();

            if (registeredUser == null)
            {
                return BadRequest(new RegisterResponse
                {
                    Message = "User not registered. Kindly get access first.",
                    Success = false
                });
            }

            var employee = await _context.Employees
            .SingleOrDefaultAsync(e => e.PIN == registeredUser.PIN);

            string firstName = employee?.Firstname ?? "";
            string surName = employee?.Surname ?? "";

            //Generate reset token
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var encodedToken = Uri.EscapeDataString(resetToken);
            registeredUser.ResetToken = resetToken;
            registeredUser.ResetTokenExpiry = DateTime.Now.AddMinutes(20);

            await _context.SaveChangesAsync();

            var resetLink = $"{_configuration["FrontendUrl"]}/reset-password?token={encodedToken}";

            var body = _emailTemplateService.BuildPasswordResetEmail(firstName, surName, resetLink);

            await _emailService.SendPasswordResetEmailAsync(registeredUser.Email, $"{firstName} {surName}".Trim(),
            body);

            return Ok(new RegisterResponse
            {
                Success = true,
                Message = "Password reset link sent. Check your email."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new RegisterResponse
            {
                Success = false,
                Message = $"An error occurred: {ex.Message}"
            });
        }
    }

    [Authorize]
    [HttpGet("Profile/{pin}")]
    public async Task<IActionResult> GetEmployeeName(string pin)
    {
        if (string.IsNullOrEmpty(pin))
            return BadRequest("Kindly log in");

        var userPin = User.Claims.FirstOrDefault(c => c.Type == "pin")?.Value;

        if (userPin != pin)
            return Forbid("You are not allowed to access this resource.");

        var employee = await _context.Employees
            .SingleOrDefaultAsync(e => e.PIN == pin && e.PIN == userPin);

        if (employee == null)
            return NotFound();

        var fullName = $"{employee.Firstname} {employee.Othernames} {employee.Surname}";
        return Ok(new
        {
            PIN = employee.PIN,
            Name = fullName
        });
    }


    private string GenerateJwtToken(UserModel user)
    {
        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, user.PIN),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim("pin", user.PIN),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
    };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        int expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]);
        var expires = DateTime.Now.AddMinutes(expireMinutes);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // In your AuthController

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest(new { Message = "Token and new password are required." });
        }

        var user = await _context.Users
            .SingleOrDefaultAsync(u => u.ResetToken == request.Token && u.ResetTokenExpiry > DateTime.Now);

        if (user == null)
        {
            return BadRequest(new { Message = "Invalid or expired token." });
        }

        // Hash the new password
        user.PasswordHash = HashPassword(request.NewPassword);

        // Invalidate token
        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Password reset successfully." });
    }

    // DTO
    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string PIN { get; set; }
        public string Email { get; set; }
    }
    private bool VerifyPassword(string plainPassword, string hashedPassword)
    {
        var hasher = new PasswordHasher<UserModel>();
        return hasher.VerifyHashedPassword(null, hashedPassword, plainPassword) == PasswordVerificationResult.Success;
    }


    private string HashPassword(string password)
    {
        var hasher = new PasswordHasher<UserModel>();
        return hasher.HashPassword(null, password);
    }

    private string DecryptPassword(string encryptedPassword, string ivBase64)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var key = sha256.ComputeHash(Encoding.UTF8.GetBytes(_configuration["Encryption:Key"])); // match frontend
        var cipherBytes = Convert.FromBase64String(encryptedPassword);
        var ivBytes = Convert.FromBase64String(ivBase64);

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = ivBytes;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
        return Encoding.UTF8.GetString(plainBytes);
    }
    private string GenerateTempPassword(string firstName, string surname)
    {
        // Take up to 4 letters from first name and surname
        var fnPart = string.IsNullOrWhiteSpace(firstName) ? "" : firstName.Trim().Substring(0, Math.Min(4, firstName.Length));
        var snPart = string.IsNullOrWhiteSpace(surname) ? "" : surname.Trim().Substring(0, Math.Min(4, surname.Length));

        // Add 4 random digits
        var randomDigits = RandomNumberGenerator.GetInt32(1000, 9999).ToString();

        // Add a special char for complexity
        var specialChar = "!";

        return $"{fnPart}{snPart}{randomDigits}{specialChar}";
    }

}