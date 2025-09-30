namespace Aespension.Models;
public class LoginRequest
{
    public string PIN { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string IV { get; set; }
}
