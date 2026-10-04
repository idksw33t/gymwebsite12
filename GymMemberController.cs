using GymManagement.Data;
using GymManagement.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Controllers
    {
        [Route("api/[controller]")]
        [ApiController]
        public class GymMemberController : ControllerBase
        {
            private readonly ApplicationDbContext dbContext;

            public GymMemberController(ApplicationDbContext dbContext)
            {
                this.dbContext = dbContext;
            }

            // GET: api/GymMember
            [HttpGet]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> GetAll()
            {
                var members = await dbContext.GymMembers
                    .Include(m => m.PersonalTrainer)
                    .Include(m => m.TrainingProgramme)
                    .ToListAsync();

                return Ok(members);
            }

            // GET: api/GymMember/{id}
            [HttpGet("{id:int}")]
            [Authorize(Roles = "Admin,PersonalTrainer,GymMember")]
            public async Task<IActionResult> Get(int id)
            {
                var member = await dbContext.GymMembers
                    .Include(m => m.PersonalTrainer)
                    .Include(m => m.TrainingProgramme)
                    .Include(m => m.WorkoutPlans)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (member == null)
                    return NotFound();

                return Ok(member);
            }

            // GET: api/GymMember/search?name=John
            [HttpGet("search")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> Search([FromQuery] string? memberNumber, [FromQuery] string? name, [FromQuery] string? surname)
            {
                var query = dbContext.GymMembers.AsQueryable();

                if (!string.IsNullOrEmpty(memberNumber))
                    query = query.Where(m => m.MemberNumber.Contains(memberNumber));
                if (!string.IsNullOrEmpty(name))
                    query = query.Where(m => m.Name.Contains(name));
                if (!string.IsNullOrEmpty(surname))
                    query = query.Where(m => m.Surname.Contains(surname));

                var results = await query.ToListAsync();
                return Ok(results);
            }

            // POST: api/GymMember
            [HttpPost]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> Create([FromBody] GymMember member)
            {
                dbContext.GymMembers.Add(member);
                await dbContext.SaveChangesAsync();
                return CreatedAtAction(nameof(Get), new { id = member.Id }, member);
            }

            // PUT: api/GymMember/{id}
            [HttpPut("{id:int}")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> Update(int id, [FromBody] GymMember updated)
            {
                var member = await dbContext.GymMembers.FindAsync(id);
                if (member == null)
                    return NotFound();

                member.Name = updated.Name;
                member.Surname = updated.Surname;
                member.Gender = updated.Gender;
                member.DateOfBirth = updated.DateOfBirth;
                member.HomeAddress = updated.HomeAddress;
                member.Email = updated.Email;
                member.PhoneNumber = updated.PhoneNumber;
                member.MembershipType = updated.MembershipType;

                await dbContext.SaveChangesAsync();
                return Ok(member);
            }

            // DELETE: api/GymMember/{id}
            [HttpDelete("{id:int}")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> Delete(int id)
            {
                var member = await dbContext.GymMembers.FindAsync(id);
                if (member == null)
                    return NotFound();

                dbContext.GymMembers.Remove(member);
                await dbContext.SaveChangesAsync();
                return NoContent();
            }

            // PATCH: api/GymMember/{id}/assign-trainer/{trainerId}
            [HttpPatch("{id:int}/assign-trainer/{trainerId:int}")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> AssignTrainer(int id, int trainerId)
            {
                var member = await dbContext.GymMembers.FindAsync(id);
                if (member == null) return NotFound("Member not found");

                var trainerExists = await dbContext.PersonalTrainers.AnyAsync(t => t.Id == trainerId);
                if (!trainerExists) return NotFound("Trainer not found");

                member.PersonalTrainerId = trainerId;
                await dbContext.SaveChangesAsync();
                return Ok(member);
            }
        }
    }


