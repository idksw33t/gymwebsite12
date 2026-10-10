using GymManagement.Models.Enums;

namespace GymManagement.DTOs.Admin;

public class MemberUpsertDto
{
    public string MemberNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string HomeAddress { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public MembershipType MembershipType { get; set; }
    public string? Password { get; set; } // only used when creating
}

public class TrainerUpsertDto
{
    public string StaffNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Specialization Specialization { get; set; }
    public string? Password { get; set; } // only used when creating
}

public class AssignTrainerDto
{
    public int? PersonalTrainerId { get; set; } // null = remove trainer
}

public class AssignProgrammeDto
{
    public int? TrainingProgrammeId { get; set; } // null = remove programme
}
