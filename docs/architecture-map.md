# Architecture Map

Use this file to help agents understand how the system is wired before changing code.

## System Shape

- Type: `<FRONTEND_ONLY | BACKEND_ONLY | FULLSTACK | API | WORKER | MONOREPO>`
- Frontend: `<FRAMEWORK_OR_NONE>`
- Backend: `<FRAMEWORK_OR_NONE>`
- Database: `<DATABASE_OR_NONE>`
- Jobs/workers: `<WORKERS_OR_NONE>`
- External integrations: `<INTEGRATIONS>`

## Local URLs

| Service | URL | Notes |
|---|---|---|
| Frontend | `<FRONTEND_URL>` | `<NOTES>` |
| Backend | `<BACKEND_URL>` | `<NOTES>` |

## Request Path

Describe the usual end-to-end path:

```text
Browser/client -> <FRONTEND_ROUTE> -> <API_ENDPOINT> -> <SERVICE> -> <REPOSITORY> -> <DATABASE> -> response
```

## Key Directories

| Directory | Purpose |
|---|---|
| `<PATH>` | `<PURPOSE>` |

## Authentication

- Flow: `<AUTH_FLOW>`
- Local/demo credentials: `<WHERE_TO_FIND_THEM>`
- Token/session storage: `<COOKIE_HEADER_STORAGE>`
- Common failure mode: `<AUTH_FAILURE>`

## Observability

- App logs: `<LOG_LOCATION>`
- API logs: `<LOG_LOCATION>`
- Job logs: `<LOG_LOCATION>`
- How to identify current request: `<CORRELATION_ID_OR_TRACE>`

## Deployment

- Environments: `<ENVIRONMENTS>`
- CI/CD: `<PIPELINE>`
- Release notes/changelog: `<LOCATION>`
