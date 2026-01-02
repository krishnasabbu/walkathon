# Fit & 50 Walkathon Portal

**Stay Consistency. Stay Fit.**

A complete walkathon activity tracking portal with no login required, JSON-based data storage, and sample data pre-loaded for instant demo.

## Features

### User Switcher
- **Switch between any participant** using the dropdown in the header
- View as **Admin** or as any **Participant**
- Instant role switching - no login required!

### Admin Features (John Admin)
- **Comprehensive Dashboard** - Real-time metrics, charts, and leaderboard
- **Participant Management** - Add, edit, activate/deactivate participants
- **Consistency Bonuses** - Calculate and award weekly bonuses
- **Data Export** - Export participant data to CSV

### Participant Features
- **Personal Dashboard** - Track progress, stats, and consistency
- **Activity Logging** - Record daily workouts and steps with real-time validation
- **Points Tracking** - Automatic point calculation
- **History View** - Review past activities and achievements

## Workout Categories & Points

### Workouts
- **Any Sport** (30 min) - 150 points - Badminton, basketball, cricket, boxing, swimming, cycling
- **Simple Cardio** (15 min) - 100 points - Jump rope, jumping jacks, stairs, walking
- **Intense Cardio** (30 min) - 180 points - Running, dance, boxing
- **Bodyweight/Functional** (30 min) - 200 points - HIIT, AMRAP, TABATA, abs
- **Gym Training** (30 min) - 200 points - Machines, dumbbells, cables, deadlifts
- **Yoga/Meditation** (30 min) - 120 points - Yoga, meditation, stretching
- **Bodyweight Challenge** (15 min) - 150 points - Planks, push-ups, squats, burpees

### Step Challenges
- 8,000 steps - 80 points
- 10,000 steps - 150 points
- 15,000 steps - 300 points
- 20,000+ steps - 500 points

### Consistency Bonuses (Weekly)
- 3 days/week - 500 points
- 5 days/week - 800 points
- 7 days/week - 1000 points

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build

```bash
npm run build
```

## Sample Data

The application comes with **11 sample participants** and realistic activity data:

**Participants:**
- John Admin (Admin) - 4,850 pts
- Sarah Johnson (Engineering) - 5,200 pts
- Michael Chen (Marketing) - 4,200 pts
- Emily Davis (Sales) - 3,800 pts
- David Martinez (Engineering) - 3,500 pts
- Lisa Anderson (HR) - 3,200 pts
- Robert Wilson (Finance) - 2,900 pts
- Jennifer Lee (Design) - 2,600 pts
- James Brown (Operations) - 2,300 pts
- Maria Garcia (Customer Support) - 2,000 pts
- Kevin Taylor (Engineering - Inactive) - 1,500 pts

**Activities:**
- 15+ sample workout activities
- Activities from past week including today
- Various workout types and step counts

**Bonuses:**
- Pre-awarded bonuses for Sarah and Michael

## How to Use

1. **Open the app** - Default view is Sarah Johnson (participant)
2. **Switch users** - Use the dropdown in the header
3. **Try as Admin** - Select "John Admin" to see admin features
4. **Log activities** - As a participant, go to "Log Activity"
5. **Award bonuses** - As admin, go to "Consistency Bonuses"

## Data Storage

All data is stored in JSON files (`src/data/`):
- `participants.json` - Participant information
- `activities.json` - Daily workouts and steps
- `bonuses.json` - Weekly consistency bonuses

Changes persist during the session but **reset on page refresh** (by design for demo purposes).

## Design

**Color Scheme:**
- 🟢 **Green** (Primary) - "Fit", wellness, success
- 🟡 **Yellow** (Secondary) - "50", achievements
- 🔴 **Red** (Accent) - Highlights, important actions

**Features:**
- Clean, modern interface
- Rounded cards with soft shadows
- Fully responsive (mobile + desktop)
- Interactive charts with Recharts
- Real-time validation and calculations

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layout/       # Header, Navigation, Layout
│   └── ui/           # Button, Card, Input, Select
├── contexts/         # App context (user switching)
├── data/             # JSON data files (database)
├── pages/            # Page components
├── services/         # Data service layer
├── types/            # TypeScript definitions
└── utils/            # Utility functions (points calculation)
```

## Key Features

✅ **No login required** - Instant access
✅ **User switcher** - Switch between any participant
✅ **Sample data** - 11 participants with realistic activities
✅ **Full validation** - Duration requirements, point calculations
✅ **Real-time updates** - Points update immediately
✅ **Export data** - CSV export for participants
✅ **Responsive design** - Works on all devices
✅ **Production ready** - Clean TypeScript, proper typing

---

**Built for Fit & 50 Walkathon Challenge**
