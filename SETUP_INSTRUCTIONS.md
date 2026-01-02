# Fit & 50 Walkathon Portal - Setup Instructions

## Initial Setup

Your Walkathon Tracking Portal is now ready to use! The application has been built successfully with all features implemented.

## Creating Your First Admin User

To get started, you need to create an admin user account. Follow these steps:

### Step 1: Sign Up an Admin Account

1. Open your browser and navigate to the portal
2. You'll see a login page
3. Since no users exist yet, you'll need to create the admin account manually through Supabase

### Step 2: Create Admin User in Supabase

Execute the following SQL in your Supabase SQL Editor:

```sql
-- First, create the auth user (you'll need to do this through Supabase Auth UI or API)
-- After creating the auth user, get the user_id and insert into participants table:

INSERT INTO participants (user_id, employee_id, name, team, email, role, status)
VALUES (
  'YOUR_USER_ID_FROM_AUTH',  -- Replace with actual user_id from auth.users
  'ADMIN001',
  'Admin User',
  'Management',
  'admin@company.com',
  'admin',
  'Active'
);
```

**OR** you can use the Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add user" and create a user with email/password
3. Copy the User ID
4. Go to Table Editor > participants
5. Insert a new row with:
   - user_id: (paste the User ID)
   - employee_id: ADMIN001
   - name: Admin User
   - team: Management
   - email: (same as auth email)
   - role: admin
   - status: Active

## Features Overview

### Admin Features
- **Dashboard**: View comprehensive metrics, charts, and leaderboard
- **Participant Management**: Add, edit, and manage all participants
- **Consistency Bonuses**: Calculate and award weekly bonuses
- **Export Data**: Export participant data to CSV

### Participant Features
- **Dashboard**: View personal stats, progress, and consistency tracking
- **Log Activity**: Record daily workouts and steps
- **Activity History**: View past activities and points earned

## Workout Types and Points

### Workout Categories
- **Any Sport** (30 min): 150 points
- **Simple Cardio** (15 min): 100 points
- **Intense Cardio** (30 min): 180 points
- **Bodyweight/Functional Training** (30 min): 200 points
- **Gym Training** (30 min): 200 points
- **Yoga/Meditation/Stretching** (30 min): 120 points
- **Bodyweight Challenge** (15 min): 150 points

### Step Challenges
- 8,000 steps: 80 points
- 10,000 steps: 150 points
- 15,000 steps: 300 points
- 20,000+ steps: 500 points

### Consistency Bonuses (Weekly)
- 3 days/week: 500 points
- 5 days/week: 800 points
- 7 days/week: 1000 points

## How to Use

### For Admins

1. **Adding Participants**:
   - Go to Participants page
   - Click "Add Participant"
   - Fill in employee details
   - Set role (Admin or Participant)
   - Participant will receive login credentials

2. **Awarding Weekly Bonuses**:
   - Go to Consistency Bonuses page
   - Select the week to review
   - Review participant consistency
   - Click "Award Bonuses" to distribute points

3. **Viewing Analytics**:
   - Dashboard shows real-time metrics
   - Daily trends for participation, steps, and workouts
   - Activity type distribution
   - Top 10 leaderboard

### For Participants

1. **Logging Activities**:
   - Go to "Log Activity"
   - Select workout type
   - Enter activity details
   - Input duration and steps
   - Submit to earn points

2. **Tracking Progress**:
   - Dashboard shows your stats
   - Weekly consistency progress
   - Current streak
   - Recent activities

## Color Scheme

The portal uses a wellness-focused color palette:
- **Green** (Primary): Success, wellness, fitness
- **Yellow** (Secondary): Achievements, points
- **Red** (Accent): Highlights, important actions

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React

## Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication with Supabase
- Protected routes for admin-only features

## Support

For any issues or questions, contact your system administrator.

---

**Stay Consistent. Stay Fit!**
