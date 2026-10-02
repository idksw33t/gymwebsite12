using GymManagement.Data;
using GymManagement.Models;
using GymManagement.Models.Entities;
using GymManagement.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.Linq;
using System.Security.Claims;

namespace GymManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Trainer")]
    public class TrainerController(ApplicationDbContext dbContext) : ControllerBase
    {
        private int? GetCurrentTrainerId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(userId == null) return null;

            var trainer = dbContext.PersonalTrainers.FirstOrDefault(t => t.UserId == userId);

            return trainer?.Id;
        }

        [HttpGet]
        [Route("dashoard")]
        public IActionResult GetDashBoard()
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbid();

            var memberCount = dbContext.GymMembers
               .Count(m => m.PersonalTrainerId == trainerId);

            var planCount = dbContext.WorkoutPlans
                .Count(p => p.GymMember != null &&  p.GymMember.PersonalTrainerId == trainerId);

            var today = DateTime.UtcNow.Date;
            var weekFromNow = today.AddDays(7);

            var tasksDueThisWeek = dbContext.WorkoutTasks
                .Count(t => t.WorkoutPlan != null && t.WorkoutPlan.GymMember !=null &&
                        t.WorkoutPlan.GymMember.PersonalTrainerId == trainerId
                        && t.DueDate >= today
                        && t.DueDate < weekFromNow
                        && t.Status != WorkoutTaskStatus.Complete);

            return Ok(new
            {
                memberCount,
                planCount,
                tasksDueThisWeek
            });
        }

        [HttpGet]
        [Route("members")]
        public IActionResult GetMembers()
        {
            var trainerId = GetCurrentTrainerId();
            if(trainerId == null) return Forbid();

            var members = dbContext.GymMembers
                .Where(m => m.PersonalTrainerId == trainerId).ToList();

            return Ok (members);
        }


        [HttpGet]
        [Route("members/{memberId:int}/plans")]
        public IActionResult GetMemberPlans(int memberId)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbid();

            var ownsMember = dbContext.GymMembers.Any(m => m.Id == memberId && m.PersonalTrainerId == trainerId);

            if (!ownsMember) return Forbid();
            var plans = dbContext.WorkoutPlans.Where(p => p.GymMemberId == memberId).Select(p => new PlanDto
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

            return Ok (plans);
        }

        [HttpPost]
        [Route("members/{memberId:int}/plans")]
        public IActionResult CreatePlan(int memberId, CreatePlanDto createPlanDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbid();

            var ownsMember = dbContext.GymMembers.Any(m => m.Id == memberId && m.PersonalTrainerId == trainerId);

            if (!ownsMember) return Forbid();
            var programmeExists = dbContext.TrainingProgrammes.Any(p => p.Id == createPlanDto.TrainingProgrammeId);

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
            if (trainerId == null) return Forbid();

            var plan = dbContext.WorkoutPlans.FirstOrDefault(p => p.Id == planId
                                  && p.GymMember!.PersonalTrainerId == trainerId);

            if (plan == null) return NotFound();
            var programmeExists = dbContext.TrainingProgrammes.Any(p => p.Id == updatePlanDto.TrainingProgrammeId);

            if (!programmeExists) return BadRequest(new { message = "Training programme not found." });

            plan.Name = updatePlanDto.Name;
            plan.Description = updatePlanDto.Description;
            plan.TrainingProgrammeId = updatePlanDto.TrainingProgrammeId;

            dbContext.SaveChanges();

            return Ok(plan);
        }

        [HttpGet]
        [Route("plans/{planId:int}/tasks")]
        public IActionResult GetPlanTasks(int planId)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbid();

            var ownsPlan = dbContext.WorkoutPlans.Any(p => p.Id == planId
                       && p.GymMember!.PersonalTrainerId == trainerId);

            if (!ownsPlan) return Forbid();

            var tasks = dbContext.WorkoutTasks.Where(t => t.WorkoutPlanId == planId).Select(t => new TaskDto
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
            if (trainerId == null) return Forbid();

            var ownsPlan = dbContext.WorkoutPlans.Any(p => p.Id == planId
                       && p.GymMember!.PersonalTrainerId == trainerId);

            if (!ownsPlan) return Forbid();

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

        [HttpPut]
        [Route("tasks/{taskId:int}")]
        public IActionResult Updatetask(int taskId, UpdateTaskDto updateTaskDto)
        {
            var trainerId = GetCurrentTrainerId();
            if (trainerId == null) return Forbid();

            var task = dbContext.WorkoutTasks.FirstOrDefault(t => t.Id == taskId
                                  && t.WorkoutPlan!.GymMember!.PersonalTrainerId == trainerId);

            if (task == null) return NotFound();

            task.ExerciseName = updateTaskDto.ExerciseName;
            task.Description = updateTaskDto.Description;
            task.Sets = updateTaskDto.Sets;
            task.Repetitions = updateTaskDto.Repetitions;
            task.DueDate = updateTaskDto.DueDate;

            dbContext.SaveChanges();

            return Ok(task);
        }

    }
}
