using GymManagement.Data;
using GymManagement.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GymManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly ApplicationDbContext context;
        private readonly IConfiguration configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.context = context;
            this.configuration = configuration;
        }

        // Public self-registration. Always creates a Member (+ their GymMember profile).
        // Trainers and admins are created by an admin, never through this endpoint.
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest(new { message = "An account with this email already exists" });

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email
            };

            var result = await userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

            await userManager.AddToRoleAsync(user, "Member");

            context.GymMembers.Add(DbSeeder.NewMemberProfile(user, dto.Name.Trim(), dto.Surname.Trim()));
            await context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully", userId = user.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!result.Succeeded)
                return Unauthorized(new { message = "Invalid email or password" });

            var roles = await userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Shape from the shared contract: { token, email, role, displayName }
            return Ok(new
            {
                token = tokenString,
                email = user.Email,
                role = roles.FirstOrDefault(),
                displayName = await GetDisplayNameAsync(user)
            });
        }

        private async Task<string> GetDisplayNameAsync(ApplicationUser user)
        {
            var member = await context.GymMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
            if (member != null) return $"{member.Name} {member.Surname}".Trim();

            var trainer = await context.PersonalTrainers.FirstOrDefaultAsync(t => t.UserId == user.Id);
            if (trainer != null) return $"{trainer.Name} {trainer.Surname}".Trim();

            return user.Email!; // admins have no profile row
        }
    }

    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
