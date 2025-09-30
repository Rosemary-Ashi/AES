using System.ComponentModel.DataAnnotations;

namespace Aespension.Models;

public class UserModel
{
    public int Id { get; set; }

    [Required]
    public string PIN { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }
}