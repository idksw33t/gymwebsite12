using GymManagement.Models.Enums;

namespace GymManagement.DTOs.Member;

public class TaskDto
{
    public int Id { get; set; }
    public string ExerciseName { get; set; } = "";
    public string Description { get; set; } = "";
    public int Sets { get; set; }
    public int Repetitions { get; set; }
    public DateOnly DueDate { get; set; }
    public WorkoutTaskStatus Status { get; set; }
    public int WorkoutPlanId { get; set; }
    public string WorkoutPlanName { get; set; } = "";
}

public class PlanDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public int GymMemberId { get; set; }
    public int TrainingProgrammeId { get; set; }
    public string TrainingProgrammeName { get; set; } = "";
    public int TaskCount { get; set; }
    public int CompletedCount { get; set; }
}

public class MemberProgrammeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int DurationWeeks { get; set; }
    public FitnessGoal FitnessGoal { get; set; }
    public string TrainerName { get; set; } = "";
    public Specialization? TrainerSpecialization { get; set; }
    public List<PlanDto> Plans { get; set; } = new();
}

public class MemberDashboardDto
{
    public string MemberName { get; set; } = "";
    public string MemberNumber { get; set; } = "";
    public MembershipType MembershipType { get; set; }
    public string ProgrammeName { get; set; } = "";
    public FitnessGoal? FitnessGoal { get; set; }
    public string TrainerName { get; set; } = "";
    public int PlanCount { get; set; }
    public int NotStartedCount { get; set; }
    public int InProgressCount { get; set; }
    public int CompleteCount { get; set; }
    public List<TaskDto> UpcomingTasks { get; set; } = new();
}

public class UpdateTaskStatusDto
{
    public WorkoutTaskStatus Status { get; set; }
}