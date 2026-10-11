using System.ComponentModel.DataAnnotations;

namespace GymManagement.Models
{
    public class CreateTaskDto
    {
        [Required] public string ExerciseName { get; set; } = string.Empty;
        [Required] public string Description { get; set; } = string.Empty;
        [Range(1, int.MaxValue)] public int Sets { get; set; }
        [Range(1, int.MaxValue)] public int Repetitions { get; set; }
        public DateTime DueDate { get; set; }
    }
}
