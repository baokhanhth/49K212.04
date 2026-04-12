# PROJECT CONTEXT

## Repository structure
- `/client`: React + TypeScript + Vite
- `/server`: NestJS + TypeORM + SQL Server

## Backend notes
- Global API prefix: `/api`
- TypeORM is configured with `synchronize=false`
- Static files served from `/uploads`
- ValidationPipe is enabled globally
- CORS is enabled

## Existing backend modules
- `san-bai`
- `lich-san`
- `dat-san`
- `check-in`
- `dashboard`

## Existing response format
Backend responses should follow the shared response format:
- `success`
- `data`
- `message`
- `error`

Use:
- `successResponse(...)`
- `errorResponse(...)`

## Important implementation rules
1. Keep implementation minimal and aligned with current codebase.
2. Follow existing NestJS structure:
   - module
   - controller
   - service
   - dto
   - entity
3. Do not refactor unrelated modules.
4. When database changes are needed, also provide SQL scripts because `synchronize=false`.
5. Prefer simple and clear logic over building a full authentication system.
6. Only implement what is necessary for the current user story.

## Current backend style
- Use TypeORM entities
- Use DTO validation with `class-validator`
- Use NestJS exceptions such as:
  - `NotFoundException`
  - `BadRequestException`

## Current task focus
Implement forgot password by email verification for backend only.