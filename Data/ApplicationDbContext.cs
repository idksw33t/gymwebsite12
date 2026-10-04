
using GymManagement.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace GymManagement.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<GymMember> GymMembers { get; set; }
        public DbSet<PersonalTrainer> PersonalTrainers { get; set; }
        public DbSet<TrainingProgramme> TrainingProgrammes { get; set; }
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public DbSet<WorkoutTask> WorkoutTasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraints
            modelBuilder.Entity<GymMember>()
                .HasIndex(m => m.MemberNumber)
                .IsUnique();

            modelBuilder.Entity<PersonalTrainer>()
                .HasIndex(t => t.StaffNumber)
                .IsUnique();

            // GymMember <-> ApplicationUser (1:1)
            modelBuilder.Entity<GymMember>()
                .HasOne(m => m.User)
                .WithOne(u => u.GymMember)
                .HasForeignKey<GymMember>(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PersonalTrainer <-> ApplicationUser (1:1)
            modelBuilder.Entity<PersonalTrainer>()
                .HasOne(t => t.User)
                .WithOne(u => u.PersonalTrainer)
                .HasForeignKey<PersonalTrainer>(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // One PersonalTrainer -> many GymMembers
            modelBuilder.Entity<GymMember>()
                .HasOne(m => m.PersonalTrainer)
                .WithMany(t => t.GymMembers)
                .HasForeignKey(m => m.PersonalTrainerId)
                .OnDelete(DeleteBehavior.SetNull);

            // One TrainingProgramme -> many GymMembers
            modelBuilder.Entity<GymMember>()
                .HasOne(m => m.TrainingProgramme)
                .WithMany(p => p.GymMembers)
                .HasForeignKey(m => m.TrainingProgrammeId)
                .OnDelete(DeleteBehavior.SetNull);

            // One GymMember -> many WorkoutPlans
            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(wp => wp.GymMember)
                .WithMany(m => m.WorkoutPlans)
                .HasForeignKey(wp => wp.GymMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            // One TrainingProgramme -> many WorkoutPlans
            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(wp => wp.TrainingProgramme)
                .WithMany(p => p.WorkoutPlans)
                .HasForeignKey(wp => wp.TrainingProgrammeId)
                .OnDelete(DeleteBehavior.Restrict);

            // One WorkoutPlan -> many WorkoutTasks
            modelBuilder.Entity<WorkoutTask>()
                .HasOne(wt => wt.WorkoutPlan)
                .WithMany(wp => wp.WorkoutTasks)
                .HasForeignKey(wt => wt.WorkoutPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}