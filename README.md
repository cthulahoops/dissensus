# Sleep Tracker

A personal sleep tracking application built with React, TypeScript, and
Supabase. Track your sleep patterns, visualize your data, and share insights
with others through secure, time-limited links.

This project grew out of my frustration with [Consensus Sleep
Diary](https://consensussleepdiary.com/). I sucessfully exported my data
from that service and imported it here.

Advantages:

- Control my data.
- Quickly see all the data without clicking through time range filters.
- See rolling averages for trends.
- 24 hour clock - enter all data on one page.
- Good readable graphs that don't start the week on a Sunday, and allow you to see data on a Sunday.

This project also became a test-bed for going all in on Agentic Development. The first
versions were entirely Vibe coded, and the later versions were still almost entirely
built by agents - but I was reviewing the code at this point. I've taken this further than I
really needed to just to see how far I could go with it.

This is my first experiment with Supabase, so I'm really learning what the capabilities are there.

The application is hosted at [dissensus.onrender.com](https://dissensus.onrender.com/). There's no open
registration, but I'm happy to create accounts for anyone who wants to try it out.  Remember though, this
is a personal project, with no warranty, license, support or data policy. It would be utterly ridiculous to trust
it with your personal (medical?) data.

Here's what Claude thinks you need to know about the project:

## Features

- 📊 **Interactive Dashboard**: Visualize your sleep data with Chart.js charts
- 📱 **Mobile-Responsive**: Optimized for both desktop and mobile devices
- 🔐 **Secure Authentication**: User authentication via Supabase Auth
- 📝 **Sleep Data Entry**: Simple form to log your sleep records
- 🔗 **Data Sharing**: Generate secure, time-limited sharing links
- 🎯 **Personal Analytics**: Track sleep quality, duration, and patterns
- 📤 **Data Export**: Export your sleep data for external analysis

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development
- **Chart.js** for data visualization
- **CSS3** with mobile-first responsive design

### Backend
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** database with Row Level Security (RLS)
- **Python** scripts for data migration and management

## Project Structure

```
dissensus/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API clients
│   │   └── main.tsx      # Application entry point
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Vite configuration
├── supabase/             # Database and backend configuration
│   ├── migrations/       # SQL migration files
│   ├── schema.sql        # Database schema
│   └── *.py             # Python utilities for data management
├── static/               # Legacy static prototype
├── docs/                 # Documentation and design specs
└── pyproject.toml        # Python dependencies
```

## Sleep Data Schema

The application tracks comprehensive sleep metrics:

- **Basic Info**: Date, user ID, optional comments
- **Sleep Timing**: Bedtime, sleep attempt time, fall asleep duration
- **Sleep Quality**: Awake episodes, total awake time, sleep quality rating
- **Wake Info**: Final awakening time, time to get out of bed
- **Metadata**: Creation and update timestamps

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.11+
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dissensus
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Python dependencies** (for data management scripts)
   ```bash
   pip install -e .
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema: `supabase/schema.sql`
   - Apply migrations from `supabase/migrations/`

5. **Configure environment variables**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

### Development

1. **Start the development server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Type checking and linting**
   ```bash
   npm run typecheck && npm run lint
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Recording Sleep Data

1. Sign up or log in to your account
2. Click "Add Sleep Record" on the dashboard
3. Fill in your sleep details:
   - When you got into bed
   - When you tried to fall asleep
   - How long it took to fall asleep
   - Number of times you woke up
   - Sleep quality rating
   - And more...

### Viewing Analytics

The dashboard provides several visualizations:
- Sleep duration trends over time
- Sleep quality patterns
- Bedtime consistency
- Wake-up time patterns

### Sharing Data

1. Click "Manage Share Links" in the dashboard
2. Generate a time-limited sharing link
3. Share the link with others (healthcare providers, researchers, etc.)
4. Links automatically expire for security

## Data Privacy & Security

- **Row Level Security**: Users can only access their own data
- **Secure Authentication**: Powered by Supabase Auth
- **Time-Limited Sharing**: Share links automatically expire
- **No Third-Party Tracking**: Your data stays private

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Python Utilities
- `python supabase/import_data.py` - Import existing sleep data
- `python supabase/create_user.py` - Create user accounts
- `python export_sleep_data.py` - Export data for analysis

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and code is properly typed
5. Submit a pull request

## Architecture Notes

- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with RLS policies
- **Real-time**: Supabase real-time subscriptions for live updates
- **Charts**: Chart.js with react-chartjs-2 wrapper
- **Styling**: Custom CSS with mobile-first responsive design

## Future Enhancements

- Sleep goal setting and tracking
- Advanced analytics and insights
- Integration with wearable devices
- Sleep pattern recommendations
- Data export to common formats (CSV, JSON)
- Dark mode support
