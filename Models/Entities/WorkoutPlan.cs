namespace GymManagement.Models.Entities
{
    public class WorkoutPlan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int GymMemberId { get; set; }
        public GymMember? GymMember { get; set; }

        public int TrainingProgrammeId { get; set; }
        public TrainingProgramme? TrainingProgramme { get; set; }

        public ICollection<WorkoutTask> WorkoutTasks { get; set; } = new List<WorkoutTask>();
    }
}
