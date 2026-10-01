using GymManagement.Models.Enums;
namespace GymManagement.Models.Entities
{
    public class WorkoutTask
    {
        public int Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Repetitions { get; set; }
        public DateTime DueDate { get; set; }
        public WorkoutTaskStatus Status { get; set; } = WorkoutTaskStatus.NotStarted;

        public int WorkoutPlanId { get; set; }
        public WorkoutPlan? WorkoutPlan { get; set; }
    }
}
