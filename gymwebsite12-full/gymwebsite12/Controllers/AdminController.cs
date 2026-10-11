using GymManagement.Data;
using GymManagement.DTOs.Admin;
using GymManagement.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        private IActionResult Fail(string message) => BadRequest(new { message });

        // ---------------------------------------------------------------- Members

        [HttpGet("members")]
        public async Task<IActionResult> GetMembers([FromQuery] string? search, [FromQuery] string? by)
        {
            var query = _context.GymMembers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = (by ?? "name").ToLower() switch
                {
                    "membernumber" => query.Where(m => m.MemberNumber.Contains(term)),
                    "surname" => query.Where(m => m.Surname.Contains(term)),
                    _ => query.Where(m => m.Name.Contains(term)),
                };
            }

            var members = await query
                .OrderBy(m => m.MemberNumber)
                .Select(m => new
                {
                    m.Id,
                    m.MemberNumber,
                    m.Name,
                    m.Surname,
                    m.Gender,
                    m.DateOfBirth,
                    m.HomeAddress,
                    m.Email,
                    m.PhoneNumber,
                    m.MembershipType,
                    m.PersonalTrainerId,
                    PersonalTrainerName = m.PersonalTrainer == null
                        ? null
                        : m.PersonalTrainer.Name + " " + m.PersonalTrainer.Surname,
                    m.TrainingProgrammeId,
                    TrainingProgrammeName = m.TrainingProgramme == null ? null : m.TrainingProgramme.Name
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpPost("members")]
        public async Task<IActionResult> CreateMember([FromBody] MemberUpsertDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MemberNumber) || string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Surname) || string.IsNullOrWhiteSpace(dto.Email))
                return Fail("Member number, name, surname and email are required.");

            if (string.IsNullOrEmpty(dto.Password))
                return Fail("A password is required for the member's login.");

            if (await _context.GymMembers.AnyAsync(m => m.MemberNumber == dto.MemberNumber))
                return Fail("That member number is already in use.");

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return Fail("An account with this email already exists.");

            var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, EmailConfirmed = true };
            var created = await _userManager.CreateAsync(user, dto.Password);
            if (!created.Succeeded)
                return Fail(string.Join(" ", created.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "Member");

            var member = new GymMember
            {
                MemberNumber = dto.MemberNumber.Trim(),
                Name = dto.Name.Trim(),
                Surname = dto.Surname.Trim(),
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                HomeAddress = dto.HomeAddress?.Trim() ?? string.Empty,
                Email = dto.Email.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim(),
                MembershipType = dto.MembershipType,
                UserId = user.Id
            };

            try
            {
                _context.GymMembers.Add(member);
                await _context.SaveChangesAsync();
            }
            catch
            {
                await _userManager.DeleteAsync(user); // don't leave a login with no profile
                throw;
            }

            return Ok(new { member.Id });
        }

        [HttpPut("members/{id:int}")]
        public async Task<IActionResult> UpdateMember(int id, [FromBody] MemberUpsertDto dto)
        {
            var member = await _context.GymMembers.FindAsync(id);
            if (member == null) return NotFound(new { message = "Member not found." });

            if (string.IsNullOrWhiteSpace(dto.MemberNumber) || string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Surname))
                return Fail("Member number, name and surname are required.");

            if (await _context.GymMembers.AnyAsync(m => m.MemberNumber == dto.MemberNumber && m.Id != id))
                return Fail("That member number is already in use.");

            // Email is the login, so it is not changed here.
            member.MemberNumber = dto.MemberNumber.Trim();
            member.Name = dto.Name.Trim();
            member.Surname = dto.Surname.Trim();
            member.Gender = dto.Gender;
            member.DateOfBirth = dto.DateOfBirth;
            member.HomeAddress = dto.HomeAddress?.Trim() ?? string.Empty;
            member.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim();
            member.MembershipType = dto.MembershipType;

            await _context.SaveChangesAsync();
            return Ok(new { member.Id });
        }

        [HttpDelete("members/{id:int}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.GymMembers.FindAsync(id);
            if (member == null) return NotFound(new { message = "Member not found." });

            var userId = member.UserId;
            _context.GymMembers.Remove(member); // workout plans/tasks cascade
            await _context.SaveChangesAsync();

            var user = await _userManager.FindByIdAsync(userId);
            if (user != null) await _userManager.DeleteAsync(user);

            return NoContent();
        }

        // ---------------------------------------------------------------- Trainers

        [HttpGet("trainers")]
        public async Task<IActionResult> GetTrainers([FromQuery] string? search, [FromQuery] string? by)
        {
            var query = _context.PersonalTrainers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = (by ?? "name").ToLower() switch
                {
                    "staffnumber" => query.Where(t => t.StaffNumber.Contains(term)),
                    "surname" => query.Where(t => t.Surname.Contains(term)),
                    _ => query.Where(t => t.Name.Contains(term)),
                };
            }

            var trainers = await query
                .OrderBy(t => t.StaffNumber)
                .Select(t => new
                {
                    t.Id,
                    t.StaffNumber,
                    t.Name,
                    t.Surname,
                    t.Gender,
                    t.Email,
                    t.PhoneNumber,
                    t.Specialization,
                    MemberCount = t.GymMembers.Count
                })
                .ToListAsync();

            return Ok(trainers);
        }

        [HttpPost("trainers")]
        public async Task<IActionResult> CreateTrainer([FromBody] TrainerUpsertDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.StaffNumber) || string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Surname) || string.IsNullOrWhiteSpace(dto.Email))
                return Fail("Staff number, name, surname and email are required.");

            if (string.IsNullOrEmpty(dto.Password))
                return Fail("A password is required for the trainer's login.");

            if (await _context.PersonalTrainers.AnyAsync(t => t.StaffNumber == dto.StaffNumber))
                return Fail("That staff number is already in use.");

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return Fail("An account with this email already exists.");

            var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email, EmailConfirmed = true };
            var created = await _userManager.CreateAsync(user, dto.Password);
            if (!created.Succeeded)
                return Fail(string.Join(" ", created.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "Trainer");

            var trainer = new PersonalTrainer
            {
                StaffNumber = dto.StaffNumber.Trim(),
                Name = dto.Name.Trim(),
                Surname = dto.Surname.Trim(),
                Gender = dto.Gender,
                Email = dto.Email.Trim(),
                PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
                Specialization = dto.Specialization,
                UserId = user.Id
            };

            try
            {
                _context.PersonalTrainers.Add(trainer);
                await _context.SaveChangesAsync();
            }
            catch
            {
                await _userManager.DeleteAsync(user);
                throw;
            }

            return Ok(new { trainer.Id });
        }

        [HttpPut("trainers/{id:int}")]
        public async Task<IActionResult> UpdateTrainer(int id, [FromBody] TrainerUpsertDto dto)
        {
            var trainer = await _context.PersonalTrainers.FindAsync(id);
            if (trainer == null) return NotFound(new { message = "Trainer not found." });

            if (string.IsNullOrWhiteSpace(dto.StaffNumber) || string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Surname))
                return Fail("Staff number, name and surname are required.");

            if (await _context.PersonalTrainers.AnyAsync(t => t.StaffNumber == dto.StaffNumber && t.Id != id))
                return Fail("That staff number is already in use.");

            trainer.StaffNumber = dto.StaffNumber.Trim();
            trainer.Name = dto.Name.Trim();
            trainer.Surname = dto.Surname.Trim();
            trainer.Gender = dto.Gender;
            trainer.PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty;
            trainer.Specialization = dto.Specialization;

            await _context.SaveChangesAsync();
            return Ok(new { trainer.Id });
        }

        [HttpDelete("trainers/{id:int}")]
        public async Task<IActionResult> DeleteTrainer(int id)
        {
            var trainer = await _context.PersonalTrainers.FindAsync(id);
            if (trainer == null) return NotFound(new { message = "Trainer not found." });

            // Their members stay in the gym, just without a trainer.
            var members = await _context.GymMembers.Where(m => m.PersonalTrainerId == id).ToListAsync();
            foreach (var m in members) m.PersonalTrainerId = null;

            var userId = trainer.UserId;
            _context.PersonalTrainers.Remove(trainer);
            await _context.SaveChangesAsync();

            var user = await _userManager.FindByIdAsync(userId);
            if (user != null) await _userManager.DeleteAsync(user);

            return NoContent();
        }

        // ------------------------------------------------------------- Assignments

        [HttpGet("programmes")]
        public async Task<IActionResult> GetProgrammes()
        {
            var programmes = await _context.TrainingProgrammes
                .OrderBy(p => p.Name)
                .Select(p => new { p.Id, p.Name, p.Description, p.DurationWeeks, p.FitnessGoal })
                .ToListAsync();

            return Ok(programmes);
        }

        [HttpPut("members/{id:int}/trainer")]
        public async Task<IActionResult> AssignTrainer(int id, [FromBody] AssignTrainerDto dto)
        {
            var member = await _context.GymMembers.FindAsync(id);
            if (member == null) return NotFound(new { message = "Member not found." });

            if (dto.PersonalTrainerId != null &&
                !await _context.PersonalTrainers.AnyAsync(t => t.Id == dto.PersonalTrainerId))
                return Fail("Trainer not found.");

            member.PersonalTrainerId = dto.PersonalTrainerId;
            await _context.SaveChangesAsync();
            return Ok(new { member.Id, member.PersonalTrainerId });
        }

        [HttpPut("members/{id:int}/programme")]
        public async Task<IActionResult> AssignProgramme(int id, [FromBody] AssignProgrammeDto dto)
        {
            var member = await _context.GymMembers.FindAsync(id);
            if (member == null) return NotFound(new { message = "Member not found." });

            if (dto.TrainingProgrammeId != null &&
                !await _context.TrainingProgrammes.AnyAsync(p => p.Id == dto.TrainingProgrammeId))
                return Fail("Training programme not found.");

            member.TrainingProgrammeId = dto.TrainingProgrammeId;
            await _context.SaveChangesAsync();
            return Ok(new { member.Id, member.TrainingProgrammeId });
        }
    }
}
