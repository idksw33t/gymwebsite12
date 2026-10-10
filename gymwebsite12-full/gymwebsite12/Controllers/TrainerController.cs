using GymManagement.Data;
using GymManagement.Models;
using GymManagement.Models.Entities;
using GymManagement.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;

namespace GymManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Trainer")]
    public class TrainerController(ApplicationDbContext dbContext) : ControllerBase
    {
        // Returns the PersonalTrainer.Id for the logged-in user (from the token), or null
        private int? GetCurrentTrainerId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return null;

            var trainer = dbContext.PersonalTrainers.FirstOrDefault(t => t.UserId == userId);

            return trainer?.Id;
        }

        // Contract errors are always { "message": "..." }
        private IActionResult Forbidden(string message) =>
            StatusCode(StatusCodes.Status403Forbidden, new { message });

        [HttpGet]
        [Route("dashboard")]
        public IActionResult GetDashBoard()
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var trainer = dbContext.PersonalTrainers.First(t => t.Id == trainerId);

            var memberCount = dbContext.GymMembers
                .Count(m => m.PersonalTrainerId == trainerId);

            var planCount = dbContext.WorkoutPlans
                .Count(p => p.GymMember != null && p.GymMember.PersonalTrainerId == trainerId);

            var today = DateTime.UtcNow.Date;
            var weekFromNow = today.AddDays(7);

            var tasksDueThisWeek = dbContext.WorkoutTasks
                .Count(t => t.WorkoutPlan != null && t.WorkoutPlan.GymMember != null
                        && t.WorkoutPlan.GymMember.PersonalTrainerId == trainerId
                        && t.DueDate >= today
                        && t.DueDate < weekFromNow
                        && t.Status != WorkoutTaskStatus.Complete);

            return Ok(new
            {
                trainerName = trainer.Name + " " + trainer.Surname,
                staffNumber = trainer.StaffNumber,
                specialization = trainer.Specialization.ToString(),
                memberCount,
                planCount,
                tasksDueThisWeek
            });
        }

        // Programmes the trainer can pick from when creating a plan
        [HttpGet]
        [Route("programmes")]
        public IActionResult GetProgrammes()
        {
            var programmes = dbContext.TrainingProgrammes
                .OrderBy(p => p.Name)
                .Select(p => new { p.Id, p.Name })
                .ToList();

            return Ok(programmes);
        }

        [HttpGet]
        [Route("members")]
        public IActionResult GetMembers()
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var members = dbContext.GymMembers
                .Where(m => m.PersonalTrainerId == trainerId)
                .Include(m => m.PersonalTrainer)
                .Include(m => m.TrainingProgramme)
                .ToList()
                .Select(m => new
                {
                    m.Id,
                    m.MemberNumber,
                    m.Name,
                    m.Surname,
                    m.Gender,
                    DateOfBirth = m.DateOfBirth.ToString("yyyy-MM-dd"),
                    m.HomeAddress,
                    m.Email,
                    m.PhoneNumber,
                    m.MembershipType,
                    m.PersonalTrainerId,
                    PersonalTrainerName = m.PersonalTrainer == null
                        ? null
                        : m.PersonalTrainer.Name + " " + m.PersonalTrainer.Surname,
                    m.TrainingProgrammeId,
                    TrainingProgrammeName = m.TrainingProgramme?.Name
                })
                .ToList();

            return Ok(members);
        }

        [HttpGet]
        [Route("members/{memberId:int}/plans")]
        public IActionResult GetMemberPlans(int memberId)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var ownsMember = dbContext.GymMembers
                .Any(m => m.Id == memberId && m.PersonalTrainerId == trainerId);

            if (!ownsMember) return Forbidden("This member is not assigned to you.");

            var plans = dbContext.WorkoutPlans
                .Where(p => p.GymMemberId == memberId)
                .Select(p => new PlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    GymMemberId = p.GymMemberId,
                    TrainingProgrammeId = p.TrainingProgrammeId,
                    TrainingProgrammeName = p.TrainingProgramme!.Name,
                    TaskCount = p.WorkoutTasks.Count,
                    CompletedCount = p.WorkoutTasks
                        .Count(t => t.Status == WorkoutTaskStatus.Complete)
                })
                .ToList();

            return Ok(plans);
        }

        [HttpPost]
        [Route("members/{memberId:int}/plans")]
        public IActionResult CreatePlan(int memberId, CreatePlanDto createPlanDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var ownsMember = dbContext.GymMembers
                .Any(m => m.Id == memberId && m.PersonalTrainerId == trainerId);

            if (!ownsMember) return Forbidden("This member is not assigned to you.");

            var programmeExists = dbContext.TrainingProgrammes
                .Any(p => p.Id == createPlanDto.TrainingProgrammeId);

            if (!programmeExists)
                return BadRequest(new { message = "Training programme not found." });

            var planEntity = new WorkoutPlan()
            {
                Name = createPlanDto.Name,
                Description = createPlanDto.Description,
                GymMemberId = memberId,
                TrainingProgrammeId = createPlanDto.TrainingProgrammeId
            };

            dbContext.WorkoutPlans.Add(planEntity);
            dbContext.SaveChanges();

            return Ok(new { planEntity.Id });
        }

        [HttpPut]
        [Route("plans/{planId:int}")]
        public IActionResult UpdatePlan(int planId, UpdatePlanDto updatePlanDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var plan = dbContext.WorkoutPlans.FirstOrDefault(p => p.Id == planId
                                  && p.GymMember!.PersonalTrainerId == trainerId);

            if (plan == null) return NotFound(new { message = "Plan not found." });

            var programme = dbContext.TrainingProgrammes
                .FirstOrDefault(p => p.Id == updatePlanDto.TrainingProgrammeId);

            if (programme == null)
                return BadRequest(new { message = "Training programme not found." });

            plan.Name = updatePlanDto.Name;
            plan.Description = updatePlanDto.Description;
            plan.TrainingProgrammeId = updatePlanDto.TrainingProgrammeId;

            dbContext.SaveChanges();

            // Return the same shape as the GET endpoint (PlanDto), not the raw entity
            var result = new PlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                GymMemberId = plan.GymMemberId,
                TrainingProgrammeId = plan.TrainingProgrammeId,
                TrainingProgrammeName = programme.Name,
                TaskCount = dbContext.WorkoutTasks.Count(t => t.WorkoutPlanId == plan.Id),
                CompletedCount = dbContext.WorkoutTasks
                    .Count(t => t.WorkoutPlanId == plan.Id && t.Status == WorkoutTaskStatus.Complete)
            };

            return Ok(result);
        }

        [HttpGet]
        [Route("plans/{planId:int}/tasks")]
        public IActionResult GetPlanTasks(int planId)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var ownsPlan = dbContext.WorkoutPlans.Any(p => p.Id == planId
                       && p.GymMember!.PersonalTrainerId == trainerId);

            if (!ownsPlan) return Forbidden("This plan does not belong to one of your members.");

            var tasks = dbContext.WorkoutTasks
                .Where(t => t.WorkoutPlanId == planId)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    ExerciseName = t.ExerciseName,
                    Description = t.Description,
                    Sets = t.Sets,
                    Repetitions = t.Repetitions,
                    DueDate = t.DueDate,
                    Status = t.Status.ToString(),
                    WorkoutPlanId = t.WorkoutPlanId,
                    WorkoutPlanName = t.WorkoutPlan!.Name
                })
                .ToList();

            return Ok(tasks);
        }

        [HttpPost]
        [Route("plans/{planId:int}/tasks")]
        public IActionResult CreateTask(int planId, CreateTaskDto createTaskDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var ownsPlan = dbContext.WorkoutPlans.Any(p => p.Id == planId
                       && p.GymMember!.PersonalTrainerId == trainerId);

            if (!ownsPlan) return Forbidden("This plan does not belong to one of your members.");

            var taskEntity = new WorkoutTask()
            {
                ExerciseName = createTaskDto.ExerciseName,
                Description = createTaskDto.Description,
                Sets = createTaskDto.Sets,
                Repetitions = createTaskDto.Repetitions,
                DueDate = createTaskDto.DueDate,
                Status = WorkoutTaskStatus.NotStarted,
                WorkoutPlanId = planId
            };

            dbContext.WorkoutTasks.Add(taskEntity);
            dbContext.SaveChanges();

            return Ok(new { taskEntity.Id });
        }

        // Updates the task details only. The status is changed by the Member area.
        [HttpPut]
        [Route("tasks/{taskId:int}")]
        public IActionResult UpdateTask(int taskId, UpdateTaskDto updateTaskDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbidden("No trainer profile is linked to this account.");

            var task = dbContext.WorkoutTasks
                .Include(t => t.WorkoutPlan)
                .FirstOrDefault(t => t.Id == taskId
                                  && t.WorkoutPlan!.GymMember!.PersonalTrainerId == trainerId);

            if (task == null) return NotFound(new { message = "Task not found." });

            task.ExerciseName = updateTaskDto.ExerciseName;
            task.Description = updateTaskDto.Description;
            task.Sets = updateTaskDto.Sets;
            task.Repetitions = updateTaskDto.Repetitions;
            task.DueDate = updateTaskDto.DueDate;

            dbContext.SaveChanges();

            // Return the same shape as the GET endpoint (TaskDto), not the raw entity
            var result = new TaskDto
            {
                Id = task.Id,
                ExerciseName = task.ExerciseName,
                Description = task.Description,
                Sets = task.Sets,
                Repetitions = task.Repetitions,
                DueDate = task.DueDate,
                Status = task.Status.ToString(),
                WorkoutPlanId = task.WorkoutPlanId,
                WorkoutPlanName = task.WorkoutPlan!.Name
            };

            return Ok(result);
        }
    }
}