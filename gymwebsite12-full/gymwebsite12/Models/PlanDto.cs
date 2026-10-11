namespace GymManagement.Models
{
    public class PlanDto
    {
        public int Id { get; set; }                     // from WorkoutPlan.Id
        public string Name { get; set; } = string.Empty;              // from WorkoutPlan.Name
        public string? Description { get; set; }        // from WorkoutPlan.Description
        public int GymMemberId { get; set; }            // from WorkoutPlan.GymMemberId
        public int TrainingProgrammeId { get; set; }    // from WorkoutPlan.TrainingProgrammeId
        public string TrainingProgrammeName { get; set; } = string.Empty; // computed from navigation
        public int TaskCount { get; set; }              // computed: WorkoutTasks.Count
        public int CompletedCount { get; set; }
    }
}
