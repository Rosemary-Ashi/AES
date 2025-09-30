using Microsoft.EntityFrameworkCore;
using Aespension.Models;

namespace Aespension.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<BalanceModel> Balances { get; set; }
    public DbSet<StatementModel> Statements { get; set; }
    public DbSet<EmployeeModel> Employees { get; set; }
    public DbSet<UserModel> Users { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //// Configure BalanceModel as a keyless entity
        //modelBuilder.Entity<BalanceModel>().HasNoKey().ToView(null);

        //// Configure other keyless entities if needed (e.g., StatementModel)
        //modelBuilder.Entity<StatementModel>().HasNoKey().ToView(null);

        //modelBuilder.Entity<EmployeeModel>().HasNoKey().ToView(null);
        //modelBuilder.Entity<UserModel>().HasNoKey().ToView(null);
        //// Add configurations for other models if applicable
        modelBuilder.Entity<BalanceModel>().HasNoKey().ToView(null);
        modelBuilder.Entity<StatementModel>().HasNoKey().ToView(null);

        // Real table mapping for Employees
        modelBuilder.Entity<EmployeeModel>()
            .HasNoKey()
            .ToTable("employees");

        // Real table mapping for Aesusers
        modelBuilder.Entity<UserModel>()
            //.HasKey(u => u.Id)
            .ToTable("Aesusers");
    }
}
