using GymManagement.Models.Entities;
using GymManagement.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Data
{
    public static class DbSeeder
    {
        public static readonly string[] Roles = { "Admin", "Trainer", "Member" };

        // Same test logins the frontend mock used, so the team can keep using them.
        private const string DemoPassword = "password";

        public static async Task SeedAsync(IServiceProvider services, bool seedDemoUsers)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // Creates the database / applies migrations so nobody has to remember to.
            await db.Database.MigrateAsync();

            foreach (var role in Roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            if (!seedDemoUsers) return;

            await EnsureUserAsync(userManager, "admin@motionstudio.com", "Admin");

            // Programmes are shared reference data that admins assign to members.
            if (!await db.TrainingProgrammes.AnyAsync())
            {
                db.TrainingProgrammes.AddRange(
                    new TrainingProgramme { Name = "12-Week Muscle Builder", Description = "Progressive overload hypertrophy programme", DurationWeeks = 12, FitnessGoal = FitnessGoal.MuscleBuilding },
                    new TrainingProgramme { Name = "Fat Loss Starter", Description = "Beginner-friendly fat loss programme", DurationWeeks = 8, FitnessGoal = FitnessGoal.WeightLoss },
                    new TrainingProgramme { Name = "Endurance Base", Description = "Build cardio capacity", DurationWeeks = 6, FitnessGoal = FitnessGoal.Endurance });
                await db.SaveChangesAsync();
            }

            var trainerUser = await EnsureUserAsync(userManager, "trainer@motionstudio.com", "Trainer");
            var trainer = await db.PersonalTrainers.FirstOrDefaultAsync(t => t.UserId == trainerUser.Id);
            if (trainer == null)
            {
                // Numbers must be unique; if an older database already used T-0001, pick another
                var staffNumber = await db.PersonalTrainers.AnyAsync(t => t.StaffNumber == "T-0001")
                    ? "T-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()
                    : "T-0001";

                trainer = new PersonalTrainer
                {
                    StaffNumber = staffNumber,
                    Name = "Test",
                    Surname = "Trainer",
                    Gender = Gender.Other,
                    Email = trainerUser.Email!,
                    PhoneNumber = "",
                    Specialization = Specialization.GeneralFitness,
                    UserId = trainerUser.Id
                };
                db.PersonalTrainers.Add(trainer);
                await db.SaveChangesAsync();
            }

            var memberUser = await EnsureUserAsync(userManager, "member@motionstudio.com", "Member");
            var member = await db.GymMembers.FirstOrDefaultAsync(m => m.UserId == memberUser.Id);
            if (member == null)
            {
                // Same idea: null makes NewMemberProfile generate a unique number
                var memberNumber = await db.GymMembers.AnyAsync(m => m.MemberNumber == "M-0001") ? null : "M-0001";
                member = NewMemberProfile(memberUser, "Test", "Member", memberNumber);
                member.PersonalTrainerId = trainer.Id;
                member.TrainingProgrammeId = (await db.TrainingProgrammes.OrderBy(p => p.Id).FirstAsync()).Id;
                db.GymMembers.Add(member);
                await db.SaveChangesAsync();

                // One sample plan so the trainer and member screens have something to show.
                var plan = new WorkoutPlan
                {
                    Name = "Upper body",
                    Description = "Upper body strength work",
                    GymMemberId = member.Id,
                    TrainingProgrammeId = member.TrainingProgrammeId!.Value
                };
                plan.WorkoutTasks.Add(new WorkoutTask { ExerciseName = "Bench press", Description = "Flat barbell, warm up 2 sets", Sets = 4, Repetitions = 10, DueDate = DateTime.Today.AddDays(2) });
                plan.WorkoutTasks.Add(new WorkoutTask { ExerciseName = "Shoulder press", Description = "Dumbbell, controlled tempo", Sets = 3, Repetitions = 12, DueDate = DateTime.Today.AddDays(4) });
                db.WorkoutPlans.Add(plan);
                await db.SaveChangesAsync();
            }
        }

        // Profile row for a freshly registered member. The register form only collects
        // name/surname/email, so the other columns get placeholders until a profile page exists.
        public static GymMember NewMemberProfile(ApplicationUser user, string name, string surname, string? memberNumber = null) => new()
        {
            MemberNumber = memberNumber ?? "M-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
            Name = name,
            Surname = surname,
            Gender = Gender.Other,
            DateOfBirth = new DateTime(2000, 1, 1),
            HomeAddress = string.Empty,
            Email = user.Email!,
            MembershipType = MembershipType.Monthly,
            UserId = user.Id
        };

        private static async Task<ApplicationUser> EnsureUserAsync(UserManager<ApplicationUser> userManager, string email, string role)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
                var result = await userManager.CreateAsync(user, DemoPassword);
                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        $"Could not seed {email}: " + string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            if (!await userManager.IsInRoleAsync(user, role))
                await userManager.AddToRoleAsync(user, role);

            return user;
        }
    }
}
