# @insforge/cli

Command line tool for the [InsForge](https://insforge.dev) platform. Manage your databases, edge functions, storage, and more — directly from the terminal.

Designed to be both human-friendly (interactive prompts, formatted tables) and agent-friendly (structured JSON output, non-interactive mode, semantic exit codes).

## Installation

```bash
npm install -g @insforge/cli
```

Requires Node.js >= 18.

## Quick Start

```bash
# Login via browser (OAuth)
insforge login

# Or login with email/password
insforge login --email

# Check current user
insforge whoami

# List your organizations
insforge orgs list

# List projects in an organization
insforge projects list

# Link current directory to a project
insforge projects link

# Query the database
insforge db tables
insforge db query "SELECT * FROM users LIMIT 10"

# Manage records
insforge records list users --limit 5
insforge records create users --data '{"name": "Alice", "email": "alice@example.com"}'
```

## Authentication

### Browser Login (default)

```bash
insforge login
```

Opens your browser to the InsForge authorization page using OAuth 2.0 Authorization Code + PKCE. A local callback server receives the authorization code and exchanges it for tokens. Credentials are stored in `~/.insforge/credentials.json`.

### Email/Password Login

```bash
insforge login --email
```

Prompts for email and password interactively, or reads from environment variables in non-interactive mode:

```bash
INSFORGE_EMAIL=user@example.com INSFORGE_PASSWORD=secret insforge login --email --json
```

### Logout

```bash
insforge logout
```

## Global Options

All commands support the following flags:

| Flag | Description |
|------|-------------|
| `--json` | Output in JSON format (useful for scripts and AI agents) |
| `--project-id <id>` | Override the linked project ID |
| `--api-url <url>` | Override the Platform API URL |
| `-y, --yes` | Skip confirmation prompts |

## Commands

### `insforge whoami`

Show the current authenticated user.

```bash
insforge whoami
# Logged in as: alice@example.com
# Name: Alice
# ID: abc-123

insforge whoami --json
# {"id":"abc-123","name":"Alice","email":"alice@example.com",...}
```

### `insforge orgs list`

List all organizations you belong to.

```bash
insforge orgs list
```

### `insforge projects list`

List all projects in an organization.

```bash
insforge projects list
insforge projects list --org-id <org-id>
```

### `insforge projects link`

Link the current directory to an InsForge project. This creates a `.insforge/project.json` file that stores the project ID, API key, and OSS host URL for subsequent commands.

```bash
# Interactive: select from a list
insforge projects link

# Non-interactive
insforge projects link --project-id <id> --org-id <org-id>
```

### `insforge db tables`

List all database tables in the linked project.

```bash
insforge db tables
insforge db tables --json
```

### `insforge db query <sql>`

Execute a raw SQL query.

```bash
insforge db query "SELECT * FROM users LIMIT 10"
insforge db query "SELECT count(*) FROM orders" --json

# Use unrestricted mode for system table access
insforge db query "SELECT * FROM pg_tables" --unrestricted
```

### `insforge records list <table>`

List records from a table with optional filtering, sorting, and pagination.

```bash
insforge records list users
insforge records list users --select "id,name,email" --limit 10
insforge records list users --filter "name=eq.Alice" --order "created_at.desc"
insforge records list orders --limit 20 --offset 40 --json
```

### `insforge records create <table>`

Create one or more records.

```bash
insforge records create users --data '{"name": "Alice", "email": "alice@example.com"}'
insforge records create users --data '[{"name": "Bob"}, {"name": "Carol"}]'
```

### `insforge records update <table>`

Update records matching a filter.

```bash
insforge records update users --filter "id=eq.123" --data '{"name": "Alice Updated"}'
```

### `insforge records delete <table>`

Delete records matching a filter.

```bash
insforge records delete users --filter "id=eq.123"
```

### `insforge functions list`

List all edge functions.

```bash
insforge functions list
insforge functions list --json
```

### `insforge functions deploy <slug>`

Deploy an edge function. Creates the function if it doesn't exist, or updates it if it does.

```bash
insforge functions deploy my-function --file ./handler.ts
insforge functions deploy my-function --file ./handler.ts --name "My Function" --description "Does something"
```

### `insforge functions invoke <slug>`

Invoke an edge function.

```bash
insforge functions invoke my-function --data '{"key": "value"}'
insforge functions invoke my-function --method GET
insforge functions invoke my-function --data '{"key": "value"}' --json
```

### `insforge storage buckets`

List all storage buckets.

```bash
insforge storage buckets
insforge storage buckets --json
```

### `insforge storage upload <file>`

Upload a file to a storage bucket.

```bash
insforge storage upload ./photo.png --bucket images
insforge storage upload ./photo.png --bucket images --key "avatars/user-123.png"
```

### `insforge storage download <objectKey>`

Download a file from a storage bucket.

```bash
insforge storage download avatars/user-123.png --bucket images
insforge storage download avatars/user-123.png --bucket images --output ./downloaded.png
```

## Project Configuration

Running `insforge projects link` creates a `.insforge/` directory in your project:

```
.insforge/
└── project.json    # project_id, org_id, appkey, region, api_key, oss_host
```

Add `.insforge/` to your `.gitignore` — it contains your project API key.

Global configuration is stored in `~/.insforge/`:

```
~/.insforge/
├── credentials.json    # access_token, refresh_token, user profile
└── config.json         # default_org_id, platform_api_url
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `INSFORGE_ACCESS_TOKEN` | Override the stored access token |
| `INSFORGE_PROJECT_ID` | Override the linked project ID |
| `INSFORGE_API_URL` | Override the Platform API URL |
| `INSFORGE_EMAIL` | Email for non-interactive login |
| `INSFORGE_PASSWORD` | Password for non-interactive login |

## Non-Interactive / CI Usage

All commands support `--json` for structured output and `-y` to skip confirmation prompts:

```bash
# Login in CI
INSFORGE_EMAIL=$EMAIL INSFORGE_PASSWORD=$PASSWORD insforge login --email --json

# Link a project
insforge projects link --project-id $PROJECT_ID --org-id $ORG_ID -y

# Query and pipe results
insforge db query "SELECT * FROM users" --json | jq '.rows[].email'

# Upload a build artifact
insforge storage upload ./dist/bundle.js --bucket assets --key "v1.2.0/bundle.js" --json
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication failure |
| 3 | Project not linked (run `insforge projects link` first) |
| 4 | Resource not found |
| 5 | Permission denied |

## Development

```bash
git clone <repo-url>
cd insforge-CLI
npm install
npm run build
npm link        # makes `insforge` available globally

npm run dev     # watch mode for development
```

## License

Apache-2.0
