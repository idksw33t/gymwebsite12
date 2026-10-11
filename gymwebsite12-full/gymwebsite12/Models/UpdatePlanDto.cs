using System.ComponentModel.DataAnnotations;

namespace GymManagement.Models
{
    public class UpdatePlanDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required] public int TrainingProgrammeId { get; set; }
    }
}
