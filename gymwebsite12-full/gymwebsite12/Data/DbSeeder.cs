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

            await SeedSampleDataAsync(db, userManager);
        }

        // Extra demo data so lists, search, assignments and dashboards have something to show.
        // Runs once: skipped when there are already more than a handful of members.
        private static async Task SeedSampleDataAsync(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            if (await db.GymMembers.CountAsync() > 3) return;

            foreach (var (name, desc, weeks, goal) in new[]
            {
                ("Strength Foundations", "Compound lifts for raw strength", 10, FitnessGoal.Strength),
                ("Everyday Fitness", "Balanced mix of cardio and resistance", 8, FitnessGoal.GeneralFitness),
            })
            {
                if (!await db.TrainingProgrammes.AnyAsync(p => p.Name == name))
                    db.TrainingProgrammes.Add(new TrainingProgramme { Name = name, Description = desc, DurationWeeks = weeks, FitnessGoal = goal });
            }
            await db.SaveChangesAsync();
            var programmes = await db.TrainingProgrammes.OrderBy(p => p.Id).ToListAsync();

            // ---- Trainers ----
            var trainerData = new[]
            {
                ("T-0002", "Sipho", "Dlamini", Gender.Male, "sipho.dlamini@motionstudio.com", "0821234501", Specialization.WeightTraining),
                ("T-0003", "Aisha", "Patel", Gender.Female, "aisha.patel@motionstudio.com", "0821234502", Specialization.Cardio),
                ("T-0004", "Liam", "Naidoo", Gender.Male, "liam.naidoo@motionstudio.com", "0821234503", Specialization.StrengthAndConditioning),
                ("T-0005", "Chloe", "van der Merwe", Gender.Female, "chloe.vdm@motionstudio.com", "0821234504", Specialization.WeightLoss),
            };
            var trainers = new List<PersonalTrainer>();
            foreach (var (no, first, last, gender, email, phone, spec) in trainerData)
            {
                var existing = await db.PersonalTrainers.FirstOrDefaultAsync(t => t.Email == email || t.StaffNumber == no);
                if (existing != null) { trainers.Add(existing); continue; }

                var user = await EnsureUserAsync(userManager, email, "Trainer");
                var t = new PersonalTrainer { StaffNumber = no, Name = first, Surname = last, Gender = gender, Email = email, PhoneNumber = phone, Specialization = spec, UserId = user.Id };
                db.PersonalTrainers.Add(t);
                trainers.Add(t);
            }
            await db.SaveChangesAsync();

            // ---- Members ----
            var memberData = new[]
            {
                ("M-0002", "Thabo", "Mokoena", Gender.Male, new DateTime(1995, 3, 14), "12 Oak Street, Durban", "0731112201", MembershipType.Annual),
                ("M-0003", "Nomsa", "Khumalo", Gender.Female, new DateTime(1998, 7, 2), "45 Beach Road, Umhlanga", "0731112202", MembershipType.Monthly),
                ("M-0004", "James", "Smith", Gender.Male, new DateTime(1990, 11, 23), "8 Pine Avenue, Westville", "0731112203", MembershipType.Quarterly),
                ("M-0005", "Priya", "Singh", Gender.Female, new DateTime(2001, 1, 30), "77 Marine Parade, Durban", "0731112204", MembershipType.Monthly),
                ("M-0006", "Kyle", "Jacobs", Gender.Male, new DateTime(1987, 5, 9), "3 Jacaranda Lane, Pinetown", "0731112205", MembershipType.Annual),
                ("M-0007", "Lerato", "Molefe", Gender.Female, new DateTime(1999, 9, 18), "21 Berea Road, Durban", "0731112206", MembershipType.Monthly),
                ("M-0008", "Ethan", "Botha", Gender.Male, new DateTime(2003, 12, 5), "16 Hill Crescent, Kloof", "0731112207", MembershipType.Quarterly),
                ("M-0009", "Zanele", "Ndlovu", Gender.Female, new DateTime(1993, 4, 27), "90 Florida Road, Morningside", "0731112208", MembershipType.Annual),
                ("M-0010", "Ryan", "Pillay", Gender.Male, new DateTime(1996, 8, 11), "5 Sunset Drive, Ballito", "0731112209", MembershipType.Monthly),
                ("M-0011", "Megan", "Fourie", Gender.Female, new DateTime(2000, 2, 20), "32 Lake View, Hillcrest", "0731112210", MembershipType.Quarterly),
                ("M-0012", "Sam", "Taylor", Gender.Other, new DateTime(1997, 6, 6), "14 Rivonia Road, Durban North", "0731112211", MembershipType.Monthly),
                ("M-0013", "Andile", "Zulu", Gender.Male, new DateTime(1994, 10, 31), "60 Main Road, Amanzimtoti", "0731112212", MembershipType.Annual),
            };

            var members = new List<GymMember>();
            for (int i = 0; i < memberData.Length; i++)
            {
                var (no, first, last, gender, dob, address, phone, type) = memberData[i];
                var email = $"{first}.{last}@motionstudio.com".ToLowerInvariant();
                if (await db.GymMembers.AnyAsync(m => m.Email == email || m.MemberNumber == no)) continue;

                var user = await EnsureUserAsync(userManager, email, "Member");
                var m = new GymMember
                {
                    MemberNumber = no, Name = first, Surname = last, Gender = gender, DateOfBirth = dob,
                    HomeAddress = address, Email = email, PhoneNumber = phone, MembershipType = type, UserId = user.Id,
                    // Leave the last two unassigned so the Assignments screen has work to do
                    PersonalTrainerId = i < memberData.Length - 2 ? trainers[i % trainers.Count].Id : null,
                    TrainingProgrammeId = i < memberData.Length - 2 ? programmes[i % programmes.Count].Id : null,
                };
                db.GymMembers.Add(m);
                members.Add(m);
            }
            await db.SaveChangesAsync();

            // ---- Plans and tasks for assigned members ----
            var statuses = new[] { WorkoutTaskStatus.NotStarted, WorkoutTaskStatus.InProgress, WorkoutTaskStatus.Complete };
            var exercises = new[]
            {
                ("Squats", "Back squat, keep chest up", 4, 8),
                ("Deadlift", "Conventional, neutral spine", 3, 5),
                ("Pull-ups", "Full range, assisted if needed", 3, 8),
                ("Treadmill intervals", "1 min fast / 2 min easy", 6, 1),
                ("Plank", "Hold with tight core", 3, 1),
                ("Lunges", "Walking lunges with dumbbells", 3, 12),
            };

            foreach (var m in members.Where(x => x.TrainingProgrammeId != null))
            {
                var plan = new WorkoutPlan
                {
                    Name = m.MembershipType == MembershipType.Annual ? "Full body strength" : "Weekly conditioning",
                    Description = $"Plan for {m.Name} {m.Surname}",
                    GymMemberId = m.Id,
                    TrainingProgrammeId = m.TrainingProgrammeId!.Value
                };
                for (int k = 0; k < 3; k++)
                {
                    var (ex, d, sets, reps) = exercises[(m.Id + k) % exercises.Length];
                    plan.WorkoutTasks.Add(new WorkoutTask
                    {
                        ExerciseName = ex, Description = d, Sets = sets, Repetitions = reps,
                        DueDate = DateTime.Today.AddDays(k * 2 + 1),
                        Status = statuses[(m.Id + k) % statuses.Length]
                    });
                }
                db.WorkoutPlans.Add(plan);
            }
            await db.SaveChangesAsync();
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
