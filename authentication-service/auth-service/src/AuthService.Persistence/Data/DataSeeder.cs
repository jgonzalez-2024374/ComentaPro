using System;
using AuthService.Domain.Entities;
using AuthService.Domain.Constants;
using AuthService.Application.Services;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Misc;/*Para evitar costruir procedimientos almacenados y ejecutarlo aqui*/

namespace AuthService.Persistence.Data;
/*SEED: Insertar informacion en la base de datos por defecto*/
public class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!context.Roles.Any())/*Si no devuelve nada. sirve para cuando se ejecute la aplicacion de nuevo*/
        {
            var roles = new List<Role>
            {
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.ADMIN_ROLE
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.USER_ROLE
                }
            };

            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        if(!await context.Users.AnyAsync())
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.ADMIN_ROLE);
            if(adminRole != null)
            {
                var passwordHasher = new PasswordHashService();
                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();


                var adminUser = new User
                {
                    Id = userId,
                    Name = "Admin Name",
                    Surname = "Admin Surname",
                    Username = "admin",
                    Email = "admin@local.com",
                    Password = passwordHasher.HashPassword("Kinal2026!"),
                    Status = true,/*Para que no necesite correo de activacion*/

                    UserProfile = new UserProfile
                    {
                        Id = profileId,
                        UserId = userId,
                        ProfilePicture = string.Empty,
                        Phone = "00000000"
                    },

                    UserEmail = new UserEmail
                    {
                        Id = emailId,
                        UserId = userId,
                        EmailVerified = true,
                        EmailVerificationToken = null,
                        EmailVerificationTokenExpiry = null
                    },

                    UserRoles =
                    {
                        new UserRole
                        {
                            Id = userRoleId,
                            UserId = userId,
                            RoleId = adminRole.Id
                        }
                    }
                };
                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
