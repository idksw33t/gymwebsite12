using GymManagement.Data;
using GymManagement.DTOs.Member;
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

        private IActionResult MemberNotFound() =>
            NotFound(new { message = "Member profile not found for this user." });

        private static string FullName(string name, string surname) => $"{name} {surname}";

        private static TaskDto ToTaskDto(WorkoutTask t) => new()
        {
            Id = t.Id,
            ExerciseName = t.ExerciseName,
            Description = t.Description,
            Sets = t.Sets,
            Repetitions = t.Repetitions,
            DueDate = DateOnly.FromDateTime(t.DueDate),
            Status = t.Status,
            WorkoutPlanId = t.WorkoutPlanId,
            WorkoutPlanName = t.WorkoutPlan?.Name ?? ""
        };

        private static PlanDto ToPlanDto(WorkoutPlan p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            GymMemberId = p.GymMemberId,
            TrainingProgrammeId = p.TrainingProgrammeId,
            TrainingProgrammeName = p.TrainingProgramme?.Name ?? "",
            TaskCount = p.WorkoutTasks.Count,
            CompletedCount = p.WorkoutTasks.Count(t => t.Status == WorkoutTaskStatus.Complete)
        };

        // GET /api/member/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return MemberNotFound();

            var planCount = await _context.WorkoutPlans
                .CountAsync(p => p.GymMemberId == member.Id);

            var tasks = await _context.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .Where(t => t.WorkoutPlan.GymMemberId == member.Id)
                .ToListAsync();

            var upcoming = tasks
                .Where(t => t.Status != WorkoutTaskStatus.Complete)
                .OrderBy(t => t.DueDate)
                .Take(5)
                .Select(ToTaskDto)
                .ToList();

            var dto = new MemberDashboardDto
            {
                MemberName = FullName(member.Name, member.Surname),
                MemberNumber = member.MemberNumber,
                MembershipType = member.MembershipType,
                ProgrammeName = member.TrainingProgramme?.Name ?? "",
                FitnessGoal = member.TrainingProgramme?.FitnessGoal,
                TrainerName = member.PersonalTrainer != null
                    ? FullName(member.PersonalTrainer.Name, member.PersonalTrainer.Surname)
                    : "",
                PlanCount = planCount,
                NotStartedCount = tasks.Count(t => t.Status == WorkoutTaskStatus.NotStarted),
                InProgressCount = tasks.Count(t => t.Status == WorkoutTaskStatus.InProgress),
                CompleteCount = tasks.Count(t => t.Status == WorkoutTaskStatus.Complete),
                UpcomingTasks = upcoming
            };

            return Ok(dto);
        }

        // GET /api/member/programme
        [HttpGet("programme")]
        public async Task<IActionResult> GetProgramme()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return MemberNotFound();

            if (member.TrainingProgramme == null)
                return NotFound(new { message = "No training programme assigned yet." });

            var plans = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Include(p => p.WorkoutTasks)
                .Include(p => p.TrainingProgramme)
                .ToListAsync();

            var dto = new MemberProgrammeDto
            {
                Id = member.TrainingProgramme.Id,
                Name = member.TrainingProgramme.Name,
                Description = member.TrainingProgramme.Description,
                DurationWeeks = member.TrainingProgramme.DurationWeeks,
                FitnessGoal = member.TrainingProgramme.FitnessGoal,
                TrainerName = member.PersonalTrainer != null
                    ? FullName(member.PersonalTrainer.Name, member.PersonalTrainer.Surname)
                    : "",
                TrainerSpecialization = member.PersonalTrainer?.Specialization,
                Plans = plans.Select(ToPlanDto).ToList()
            };

            return Ok(dto);
        }

        // GET /api/member/plans
        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return MemberNotFound();

            var plans = await _context.WorkoutPlans
                .Where(p => p.GymMemberId == member.Id)
                .Include(p => p.WorkoutTasks)
                .Include(p => p.TrainingProgramme)
                .ToListAsync();

            return Ok(plans.Select(ToPlanDto).ToList());
        }

        // GET /api/member/tasks?status=&planId=
        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks([FromQuery] string? status, [FromQuery] int? planId)
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return MemberNotFound();

            var query = _context.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .Where(t => t.WorkoutPlan.GymMemberId == member.Id);

            if (planId.HasValue)
                query = query.Where(t => t.WorkoutPlanId == planId.Value);

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<WorkoutTaskStatus>(status, true, out var parsedStatus))
                    return BadRequest(new { message = "Invalid status value. Use NotStarted, InProgress, or Complete." });

                query = query.Where(t => t.Status == parsedStatus);
            }

            var tasks = await query.OrderBy(t => t.DueDate).ToListAsync();

            return Ok(tasks.Select(ToTaskDto).ToList());
        }

        // PUT /api/member/tasks/{taskId}/status
        [HttpPut("tasks/{taskId}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int taskId, [FromBody] UpdateTaskStatusDto dto)
        {
            var member = await GetCurrentMemberAsync();
            if (member == null) return MemberNotFound();

            if (!Enum.TryParse<WorkoutTaskStatus>(dto.Status, true, out var newStatus))
                return BadRequest(new { message = "Invalid status value. Use NotStarted, InProgress, or Complete." });

            var task = await _context.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                return NotFound(new { message = "Task not found." });

            if (task.WorkoutPlan == null || task.WorkoutPlan.GymMemberId != member.Id)
                return StatusCode(403, new { message = "You can only update your own tasks." });

            task.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(ToTaskDto(task));
        }
    }
}