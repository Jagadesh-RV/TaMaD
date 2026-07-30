# TaMaD Meet API

Base URL: `/api/tamad-meet`

## Endpoints

### `POST /`
Create a new meeting.
- **Body**: `{ title, teamId, startTime, meetingType, duration }`
- **Response**: `{ meeting }`

### `GET /?teamId=:id`
List meetings for a team.
- **Response**: `{ meetings: [...] }`

### `POST /room/:roomId/join`
Request access to join an active room. Validates permissions and issues authorization.
- **Response**: `{ room, participant }`
