namespace Aespension.Models;

public class StatementModel
{
    public short? sn { get; set; }
    public string? pin { get; set; }
    public string? header { get; set; }
    public string? descr { get; set; }
    public string? tranS_DATE { get; set; }
    public decimal? mandatory { get; set; }
    public decimal? voluntary { get; set; }
    public decimal? preactnsitf { get; set; }
    public decimal? total { get; set; }
    public string? remark { get; set; }
    public DateTime? contdate { get; set; }
}