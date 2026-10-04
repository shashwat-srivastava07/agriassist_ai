# Contributing to AgriAssist AI

Thank you for contributing to AgriAssist AI.

This repository uses a two-level workflow:

```text
feature branch
     ↓
Pull Request
     ↓
agriassist-development
     ↓
Testing / validation
     ↓
Pull Request
     ↓
main (protected)
     ↓
Production
```

## Branches

### `main`

`main` is the protected production branch.

- Do not push directly to `main`.
- Changes must go through a Pull Request.
- At least one approval is required before merging.
- Force pushes and branch deletion are restricted.

### `agriassist-development`

This is the team's shared development branch.

Use it as the starting point for new feature branches.

## Creating a Feature Branch

First update your local development branch:

```bash
git checkout agriassist-development
git pull origin agriassist-development
```

Create a branch for your work:

```bash
git checkout -b feature/<feature-name>
```

Examples:

```bash
git checkout -b feature/disease-scanner
git checkout -b feature/weather-improvements
git checkout -b feature/market-intelligence
git checkout -b feature/ui-improvements
```

## Making Changes

Work only on your feature branch.

Before committing, check:

```bash
git status
```

Build the project when appropriate:

```bash
npm run build
```

Commit focused changes with a clear message:

```bash
git add <files>
git commit -m "Add disease scanner improvements"
```

Prefer clear, specific commit messages such as:

```text
Add weather forecast validation
Fix disease scanner result display
Improve farm planner calendar
Update market intelligence UI
Fix Hindi weather translations
```

## Push Your Branch

Push your feature branch to GitHub:

```bash
git push -u origin feature/<feature-name>
```

## Create a Pull Request

Open the GitHub repository and create a Pull Request.

For normal feature work:

```text
base:    agriassist-development
compare: feature/<feature-name>
```

Explain in the Pull Request:

- What was changed
- Why it was changed
- How it was tested
- Any known limitations

Add screenshots when the change affects the UI.

## Pull Request Review

Another team member should review the Pull Request before it is merged.

Resolve review comments before merging.

Keep Pull Requests focused. Avoid combining unrelated features or large cleanup changes into one PR.

## Updating Your Branch

If `agriassist-development` has changed while you are working:

```bash
git checkout agriassist-development
git pull origin agriassist-development
```

Then update your feature branch using the team's agreed Git workflow before continuing.

Do not force-push shared branches.

## Production Workflow

Only tested changes should move toward production:

```text
feature/<feature-name>
        ↓
agriassist-development
        ↓
Testing
        ↓
main
```

`main` is protected and represents the stable production version.

## Environment Variables and Secrets

Never commit `.env` or secret API keys.

Keep local secrets in `.env`.

Use `.env.example` as the template for required variables.

Never expose or commit:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CF_AIG_TOKEN`
- `WEATHERAPI_KEY`
- Google/Gemini provider secrets
- Other private credentials

If a secret is accidentally committed, notify the repository owner immediately and rotate the exposed credential.

## Before Opening a Pull Request

Check:

```bash
git status
npm run build
```

Make sure:

- The intended files are changed.
- No `.env` or secrets are included.
- The application builds successfully.
- UI changes have been tested.
- The Pull Request description explains the change.

## Contribution History

Use your own GitHub account when making commits and Pull Requests.

Do not share GitHub accounts or credentials.

This allows GitHub to correctly record:

- Individual commits
- Pull Requests
- Code reviews
- Approvals
- File changes
- Team contributions

## Questions

If a change affects the production architecture, database schema, authentication, AI integrations, deployment configuration, or security, discuss it with the repository owner before merging.
