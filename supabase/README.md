# Sleep Data Import Script

This Python script imports sleep data from a JSON file into a Supabase database.

## Setup

The project uses `uv` for dependency management. Dependencies are already configured in `pyproject.toml`.

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

## Usage

```bash
# Basic usage (uses test@sleeptracker.local)
uv run supabase/import_data.py static/sleep_data.json

# With custom email
uv run supabase/import_data.py static/sleep_data.json --email user@example.com

# With custom batch size
uv run supabase/import_data.py static/sleep_data.json --batch-size 25

# All options combined
uv run supabase/import_data.py static/sleep_data.json --email user@example.com --batch-size 25

# Show help
uv run supabase/import_data.py --help
```

## Features

- **Command-line interface**: Use argparse to specify the input JSON file
- **Custom user email**: Specify which user to import data for with `--email`
- **Automatic password generation**: Generates and displays a secure random password for new users
- **Completed entries only**: Filters out incomplete/unstarted entries automatically
- **Batch processing**: Import data in configurable batches (default: 50 records)
- **User management**: Creates new users or finds existing ones
- **Data validation**: Filters out records with invalid dates
- **Progress tracking**: Shows progress as batches are imported
- **Verification**: Confirms successful import with record count

## Differences from Node.js Version

- Uses Python with type hints for better code clarity
- More specific exception handling (ValueError, RuntimeError vs generic Exception)
- Command-line argument parsing with argparse
- Cleaner separation of concerns between functions
- No broad try-catch wrapper (exceptions propagate naturally)

## Notes

- The script creates a test user (`test@sleeptracker.local`) for importing data
- In production, you would replace this with actual user authentication
- The script uses the Supabase service key to bypass RLS for importing
