# Motion Studio Management

ASP.NET Core Web API (SQL Server LocalDB) + React frontend.

## Requirements

- .NET 10 SDK
- Node.js 18+ and npm
- SQL Server LocalDB (installed with Visual Studio on Windows)

## 1. Run the API

From the project root (the folder containing `GymManagement.csproj`):

```bash
dotnet restore
dotnet dev-certs https --trust     # first time only
dotnet run --launch-profile https
```

On first start the app automatically:

- creates the `GymManagementDb` database and applies migrations
- creates the roles Admin, Trainer and Member
- adds demo data (3 training programmes, 1 sample plan with tasks)

Swagger opens at https://localhost:7005/swagger

## 2. Run the frontend

In a second terminal:

```bash
cd Frontend
npm install        # first time only
npm start
```

Opens at http://localhost:3000 (the API only accepts requests from this address).

If the API address ever changes, edit `Frontend/.env.development`:

```
REACT_APP_API_URL=https://localhost:7005/api
```

## Demo logins (Development only)

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@motionstudio.com   | `password` |
| Trainer | trainer@motionstudio.com | `password` |
| Member  | member@motionstudio.com  | `password` |

After login each role is sent to its own dashboard:

- Admin: `/admin/dashboard` (members, trainers, assignments)
- Trainer: `/trainer/dashboard` (members, workout plans, tasks)
- Member: `/member/dashboard` (programme, plans, tasks)

New users who sign up at `/register` are always Members. Admins create trainers and members from the admin dashboard.

## Testing protected endpoints in Swagger

1. Call `POST /api/auth/login` with a demo login.
2. Copy the `token` from the response.
3. Click **Authorize** (top right) and paste the token.

## Database commands

```bash
dotnet ef database update                 # apply migrations manually
dotnet ef database drop --force           # wipe the database (it is recreated on next run)
```

Install the EF tool once with `dotnet tool install --global dotnet-ef`.

## Troubleshooting

- **"Cannot reach the server" on the login page**: the API isn't running, or the browser doesn't trust the https certificate. Run `dotnet dev-certs https --trust` and restart the API.
- **Swagger page is blank / 404**: make sure you started with `--launch-profile https` (or `http`) so the environment is `Development`.
- **Demo logins missing**: they are only seeded in the Development environment.
- **Database errors on start**: LocalDB must be installed. Check with `sqllocaldb info`.
