# Sleep Tracker Design

## Objective
Create a personal sleep-tracking app using Supabase and React.

## Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase
- **Deployment**: Render.com or DigitalOcean Apps

## Existing Prototype
- Interactive dashboard with Chart.js visualizations in `static/`
- Sleep data processing and chart generation logic
- Mobile-friendly CSS styling
- JSON data format already defined

## Features
- Mobile-responsive dashboard
- Data entry via a simple form
- Supabase for authentication and data storage
- Optional dual-write to Consensus API
- Port existing Chart.js visualizations to React
- Reuse existing data processing logic

## Implementation Steps
1. **Supabase Setup**
   - Create project and configure schema and RLS policies
   - Write data import script to migrate existing JSON data
2. **Frontend Development**
   - Scaffold React app with Vite
   - Implement data entry form and chart dashboard
3. **Integration with Supabase**
   - Use Supabase client for data operations
   - Set up Supabase Auth
4. **Deployment**
   - Deploy as a static site

## Optional Enhancements
- Data export functionality
- Dual-write data to Consensus API (dependent on CORS)

---
*Prepared 26 Jun 2025 – export-consensus project*
