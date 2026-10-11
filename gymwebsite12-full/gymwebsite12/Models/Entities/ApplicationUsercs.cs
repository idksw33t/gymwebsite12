using Microsoft.AspNetCore.Identity;
namespace GymManagement.Models.Entities

{
    public class ApplicationUser : IdentityUser
    {
        public GymMember? GymMember { get; set; }
        public PersonalTrainer? PersonalTrainer { get; set; }
    }
}
