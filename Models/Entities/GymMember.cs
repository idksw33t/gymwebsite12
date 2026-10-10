using GymManagement.Models.Enums;

namespace GymManagement.Models.Entities
{
    public class GymMember
    {
        public int Id { get; set; }
        public string MemberNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string HomeAddress { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public MembershipType MembershipType { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public int? PersonalTrainerId { get; set; }
        public PersonalTrainer? PersonalTrainer { get; set; }

        public int? TrainingProgrammeId { get; set; }
        public TrainingProgramme? TrainingProgramme { get; set; }

        public ICollection<WorkoutPlan> WorkoutPlans { get; set; } = new List<WorkoutPlan>();
    }
}
