using GymManagement.Data;
using GymManagement.Models.Entities;
using GymManagement.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymManagement.Controllers
{
    [Route("api/member")]
    [ApiController]
    [Authorize(Roles = "Member")]
    public class MemberController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MemberController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<GymMember?> GetCurrentMemberAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return null;

            return await _context.GymMembers
                .Include(m => m.PersonalTrainer)
                .Include(m => m.TrainingProgramme)
                .FirstOrDefaultAsync(m => m.UserId == userId);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return NotFound("Member profile not found for this user.");

            var planIds = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Select(p => p.Id)
                .ToListAsync();

            var tasks = await _context.WorkoutTasks
                .Where(t => planIds.Contains(t.WorkoutPlanId))
                .ToListAsync();

            var upcoming = tasks
                .Where(t => t.Status != WorkoutTaskStatus.Complete)
                .OrderBy(t => t.DueDate)
                .Take(5)
                .Select(t => new
                {
                    id = t.Id,
                    exerciseName = t.ExerciseName,
                    dueDate = t.DueDate.ToString("yyyy-MM-dd"),
                    status = t.Status.ToString()
                });

            return Ok(new
            {
                memberName = $"{member.Name} {member.Surname}",
                memberNumber = member.MemberNumber,
                membershipType = member.MembershipType.ToString(),
                programmeName = member.TrainingProgramme?.Name,
                fitnessGoal = member.TrainingProgramme?.FitnessGoal.ToString(),
                trainerName = member.PersonalTrainer != null
                    ? $"{member.PersonalTrainer.Name} {member.PersonalTrainer.Surname}"
                    : null,
                planCount = planIds.Count,
                notStartedCount = tasks.Count(t => t.Status == WorkoutTaskStatus.NotStarted),
                inProgressCount = tasks.Count(t => t.Status == WorkoutTaskStatus.InProgress),
                completeCount = tasks.Count(t => t.Status == WorkoutTaskStatus.Complete),
                upcomingTasks = upcoming
            });
        }

        [HttpGet("programme")]
        public async Task<IActionResult> GetProgramme()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return NotFound("Member profile not found for this user.");

            if (member.TrainingProgramme == null)
                return Ok(new { message = "No training programme assigned yet." });

            var plans = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Include(p => p.WorkoutTasks)
                .ToListAsync();

            return Ok(new
            {
                id = member.TrainingProgramme.Id,
                name = member.TrainingProgramme.Name,
                description = member.TrainingProgramme.Description,
                durationWeeks = member.TrainingProgramme.DurationWeeks,
                fitnessGoal = member.TrainingProgramme.FitnessGoal.ToString(),
                trainerName = member.PersonalTrainer != null
                    ? $"{member.PersonalTrainer.Name} {member.PersonalTrainer.Surname}"
                    : null,
                trainerSpecialization = member.PersonalTrainer?.Specialization.ToString(),
                plans = plans.Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    taskCount = p.WorkoutTasks.Count
                })
            });
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return NotFound("Member profile not found for this user.");

            var plans = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Include(p => p.WorkoutTasks)
                .Include(p => p.TrainingProgramme)
                .ToListAsync();

            var result = plans.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                description = p.Description,
                trainingProgrammeId = p.TrainingProgrammeId,
                trainingProgrammeName = p.TrainingProgramme?.Name,
                taskCount = p.WorkoutTasks.Count,
                completedCount = p.WorkoutTasks.Count(t => t.Status == WorkoutTaskStatus.Complete)
            });

            return Ok(result);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks([FromQuery] string? status, [FromQuery] int? planId)
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return NotFound("Member profile not found for this user.");

            var planIds = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Select(p => p.Id)
                .ToListAsync();

            var query = _context.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .Where(t => planIds.Contains(t.WorkoutPlanId));

            if (planId.HasValue)
                query = query.Where(t => t.WorkoutPlanId == planId.Value);

            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<WorkoutTaskStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(t => t.Status == parsedStatus);
            }

            var tasks = await query.ToListAsync();

            var result = tasks.Select(t => new
            {
                id = t.Id,
                exerciseName = t.ExerciseName,
                description = t.Description,
                sets = t.Sets,
                repetitions = t.Repetitions,
                dueDate = t.DueDate.ToString("yyyy-MM-dd"),
                status = t.Status.ToString(),
                workoutPlanId = t.WorkoutPlanId,
                workoutPlanName = t.WorkoutPlan != null ? t.WorkoutPlan.Name : null
            });

            return Ok(result);
        }

        public class UpdateStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpPut("tasks/{taskId}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int taskId, [FromBody] UpdateStatusDto dto)
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return NotFound("Member profile not found for this user.");

            if (!Enum.TryParse<WorkoutTaskStatus>(dto.Status, true, out var newStatus))
                return BadRequest(new { message = "Invalid status value. Use NotStarted, InProgress, or Complete." });

            var task = await _context.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null) return NotFound("Task not found.");

            if (task.WorkoutPlan == null || task.WorkoutPlan.GymMemberId != member.Id)
                return Forbid();

            task.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { id = task.Id, status = task.Status.ToString() });
        }
    }
}