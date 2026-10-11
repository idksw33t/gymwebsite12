namespace GymManagement.Models
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Repetitions { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int WorkoutPlanId { get; set; }
        public string WorkoutPlanName { get; set; } = string.Empty;
    }
}
