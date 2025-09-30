namespace Aespension.Server.Services
{
    public interface IEmailTemplateService
    {
        string BuildPasswordResetEmail(string firstName, string surnName, string resetLink);
    }
    public class EmailTemplateService : IEmailTemplateService
    {
        public string BuildPasswordResetEmail(string firstName, string surnName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Password Reset</title>
</head>
<body style=""font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;"">
    <table style=""max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;"">
        <tr><td>
            <p>Dear {surnName} {firstName},</p>

            <p>We have received a password reset request for your AES self-service portal account.</p>

            <p>
                Please click on the button below to proceed with the password reset process
                (Note that the link expires in 24 hours):
            </p>

            <p style=""text-align: center;"">
                <a href=""{resetLink}""
                   style=""display:inline-block; padding:10px 20px; background-color:#007bff; 
                   color:white; text-decoration:none; border-radius:5px; font-weight:bold;"">
                   Reset Password
                </a>
            </p>

            <p>If you did not make this request, please ignore this email.
               Your current password will remain unchanged.</p>

            <p>
                For any further assistance or inquiries, please contact our 
                Support team at <a href=""mailto:support@yourorg.com"">enquiries@gtpensionmanagers.com</a>.
            </p>

            <p>Regards,<br/>The GTPension Team</p>
        </td></tr>
    </table>
</body>
</html>";
        }
    }
}