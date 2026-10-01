using GymManagement.Models.Enums;

namespace GymManagement.Models.Entities
{
    public class TrainingProgramme
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationWeeks { get; set; }
        public FitnessGoal FitnessGoal { get; set; }

        public ICollection<GymMember> GymMembers { get; set; } = new List<GymMember>();
        public ICollection<WorkoutPlan> WorkoutPlans { get; set; } = new List<WorkoutPlan>();

    }
}
