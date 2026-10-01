using GymManagement.Models.Enums;

namespace GymManagement.Models.Entities
{
    public class PersonalTrainer
    {
        public int Id { get; set; }
        public string StaffNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public Gender Gender { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public Specialization Specialization { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public ICollection<GymMember> GymMembers { get; set; } = new List<GymMember>();
    }
}
