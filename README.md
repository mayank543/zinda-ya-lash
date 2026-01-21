# Zinda Ya Lash - Uptime Monitoring Dashboard

A self-hosted uptime monitoring solution that helps you keep track of your websites, APIs, and services. Think of it as your personal UptimeRobot - you own the data, you control the checks, and you get notified the moment something goes wrong.

## What This Project Does

At its core, this application periodically pings your websites and services to check if they are online. When something goes down, it logs the incident, tracks how long the outage lasted, and can notify you through email, webhooks, or Slack. You also get a nice dashboard to visualize uptime history and response times over time.

Here is what you can do with it:

- Add and manage monitors for HTTP endpoints, ping targets, port checks, and keyword searches
- View real-time status of all your monitors with response time charts
- Track incidents automatically when monitors go down, with root cause logging
- Create public status pages to share uptime information with your users
- Set up notification channels to get alerted through email, Slack, or custom webhooks
- Customize status page appearance with your own logo, colors, and layout preferences

## Tech Stack

This project is built with modern web technologies that prioritize developer experience and performance:

**Frontend**
- Next.js 16 with the App Router for server-side rendering and routing
- React 19 for the user interface
- TailwindCSS 4 for styling
- Radix UI primitives for accessible, unstyled components
- Recharts for data visualization
- Zustand for lightweight state management
- React Hook Form with Zod for form handling and validation

**Backend**
- Next.js API routes for server-side logic
- Supabase for the database (PostgreSQL) and authentication
- Row Level Security (RLS) policies for data protection
- Resend for transactional emails

**Tooling**
- TypeScript for type safety
- ESLint for code quality
- Vercel for deployment

## Project Structure

The codebase follows the standard Next.js App Router conventions:

```
src/
  app/
    (dashboard)/          # Main dashboard pages (monitors, incidents, settings, etc.)
    api/                  # API routes for monitors, incidents, notifications, cron jobs
    auth/                 # Authentication callback handlers
    login/                # Login page
    status/[slug]/        # Public status pages
  components/
    dashboard/            # Dashboard-specific components
    monitors/             # Monitor management components
    settings/             # Settings and configuration components
    status-pages/         # Status page components
    ui/                   # Reusable UI primitives (buttons, dialogs, inputs, etc.)
  hooks/                  # Custom React hooks
  lib/                    # Utilities and Supabase client configuration
```

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Node.js 18 or later
- npm, yarn, or pnpm package manager
- A Supabase account (free tier works fine for personal use)

### Setting Up Supabase

1. Create a new project in your Supabase dashboard at https://supabase.com

2. Once your project is ready, run the database migrations. You can do this by going to the SQL Editor in your Supabase dashboard and executing the SQL files in order:
   - `supabase_schema.sql` (base schema for monitors, heartbeats, incidents, status pages)
   - `migration_auth_rls.sql` (authentication and row level security)
   - `migration_notifications.sql` (notification channels)
   - `migration_appearance.sql` (status page customization)
   - `migration_incidents.sql` (incident tracking enhancements)
   - `migration_additional_features.sql` (any additional features)

3. Copy your project URL and anon key from the Supabase dashboard. You will find these under Settings > API.

### Local Development

1. Clone this repository to your local machine:

```bash
git clone <your-repository-url>
cd Figmenta_UptimeRobot
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:

```bash
npm run dev
```

5. Open http://localhost:3000 in your browser.

### Setting Up Automated Checks (Cron Jobs)

For the monitors to actually check your services periodically, you need to trigger the cron API endpoint. In production, you can use:

- Vercel Cron (if deploying to Vercel)
- An external cron service like cron-job.org
- Any scheduler that can make HTTP requests

The endpoint to hit is: `GET /api/cron`

For local testing, you can simply visit this URL in your browser or use curl to trigger a check manually.

## Deployment

The easiest way to deploy this application is through Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Deploy

For other platforms, run the build command and serve the output:

```bash
npm run build
npm run start
```

## Configuration Notes

**Authentication**: The application uses Supabase Auth. Users can sign up and log in, and all their monitors and notification channels are scoped to their account through Row Level Security.

**Public Status Pages**: You can create public-facing status pages with custom slugs. These are accessible at `/status/[slug]` and do not require authentication to view.

**Notification Channels**: Currently supports email (via Resend), Slack webhooks, and generic webhooks. Configure your Resend API key if you want email notifications.

## Things to Keep in Mind

- The free tier of Supabase has limitations on database size and API calls. For personal projects or small teams, this should be more than enough.
- Response time accuracy depends on where your checks are running from. If you deploy to Vercel, checks originate from Vercel's edge network.
- For production use, consider setting appropriate check intervals to avoid rate limiting your own services.

## License

This project is open source. Feel free to use it, modify it, and learn from it. (Still things to improve,lacking features and some bugs)
