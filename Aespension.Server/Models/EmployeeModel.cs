namespace Aespension.Models;

public class EmployeeModel
{
    public string PIN { get; set; }
    public string Surname { get; set; }
    public string Firstname { get; set; }
    public string Othernames { get; set; }
    public DateTime Date_Of_Birth { get; set; }
    public string Mobile_Phone { get; set; }
    public string? Email { get; set; }
    public bool Pin_Invalid { get; set; }
    public decimal? Scheme_Id { get; set; }
}