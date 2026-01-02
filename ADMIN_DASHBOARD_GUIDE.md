# Admin Dashboard User Guide

## Overview
The Admin Dashboard provides comprehensive workout data management with advanced filtering, historical viewing, and export capabilities.

## Features

### 1. Time Period Filtering
Access workout data across different time periods:
- **Today**: View current day's activities only
- **Week**: View this week's data (Monday to Sunday)
- **Month**: View current month's data
- **All**: View all historical data

**How to use:**
1. Click one of the four time period buttons at the top of the filters section
2. Data automatically updates to show the selected period

### 2. Custom Date Range
For specific historical data analysis:

**How to use:**
1. Select a start date from the first date picker
2. Select an end date from the second date picker
3. Data automatically updates to show activities within the selected range

**Notes:**
- Cannot select future dates
- End date must be after start date
- Selecting a custom date range overrides the time period filter

### 3. Category Filtering
Filter data by specific workout categories:

**How to use:**
1. Select a category from the "Category Filter" dropdown
2. Choose "All Categories" to view all activities
3. Select a specific category (Running, Cycling, Swimming, etc.) to view only that type

### 4. User Filtering
View data for specific participants:

**How to use:**
1. Select a participant from the "User Filter" dropdown
2. Choose "All Users" to view combined data
3. Select a specific user to view only their activities

**Tip:** Use user filtering to generate personalized reports for individual participants

### 5. View Modes

#### Overview Mode
Displays visual charts and graphs:
- **Minutes by Category** - Bar chart showing total workout minutes per category
- **Activity Distribution** - Pie chart showing the distribution of activities across categories

#### By Category Mode
Detailed table breakdown showing:
- Category name with color indicator
- Total number of activities
- Total minutes logged
- Total points earned
- Average minutes per activity
- Summary totals at the bottom

**Use case:** Identify which workout types are most popular or underutilized

#### By User Mode
Comprehensive user ranking table showing:
- User rank based on total minutes
- Participant name and team
- Total activities logged
- Total minutes and points
- Average minutes per day
- Summary totals at the bottom

**Use case:** Create leaderboards, identify top performers, track individual progress

### 6. Key Metrics Dashboard
Four metric cards display at-a-glance statistics:
- **Total Minutes** - Sum of all workout minutes in selected period/filters
- **Total Points** - Sum of all points earned
- **Activities** - Total number of logged activities
- **Active Users** - Number of unique participants who logged activities

**All metrics update automatically** based on your selected filters

### 7. Excel Export

#### Export Features
The Excel export creates a comprehensive workbook with multiple tabs:

**Daily Activity Tabs:**
- Each date gets its own tab (e.g., "Jan-02-2026", "Jan-01-2026")
- Tabs are ordered from most recent to oldest
- Each tab includes:
  - Date, Participant name, Employee ID, Team
  - Category, Workout type, Activity details
  - Duration in minutes, Points earned, Points per minute
  - Daily totals at the bottom

**Summary Tab:**
- Overall participant statistics
- Sorted by total points (highest to lowest)
- Shows: Total activities, Total minutes, Total points, Average minutes per day
- Only includes participants with activities in the selected period

**By Category Tab:**
- Category-level statistics
- Shows: Total activities, Total minutes, Total points, Average duration
- Only includes categories used in the selected period

#### How to Export:
1. Set your desired filters (time period, date range, category, user)
2. Click the "Export to Excel" button in the top right
3. Wait for the export to complete (button shows "Exporting...")
4. File automatically downloads to your default downloads folder

**File naming convention:**
`Workout_Data_[StartDate]_to_[EndDate].xlsx`

Example: `Workout_Data_Dec-29_to_Jan-02-2026.xlsx`

#### Export Use Cases:
- **Weekly Reports**: Set to "Week" and export every Monday
- **Monthly Reports**: Set to "Month" and export at end of month
- **Filtered Reports**: Apply category or user filters before exporting
- **Historical Analysis**: Use custom date range to export specific periods
- **Individual Reports**: Filter by user and export for one-on-one reviews

### 8. Historical Data Navigation

#### Viewing Past Data
Access any historical date or date range:

**Quick access:**
- Click "Today" for current day
- Click "Week" for this week
- Click "Month" for this month

**Specific dates:**
1. Use the Custom Date Range pickers
2. Select any past date (future dates are disabled)
3. View complete historical data for that period

**Examples:**
- View last week: Select dates 7 days ago to yesterday
- View specific event: Select the event's start and end dates
- View year-to-date: Select January 1 to today

### 9. Combined Filtering

Filters can be combined for powerful data analysis:

**Examples:**
1. **Weekly category analysis**:
   - Time Period: Week
   - View Mode: By Category
   - Shows which categories were most popular this week

2. **User's monthly progress**:
   - Time Period: Month
   - User Filter: Select specific user
   - View Mode: By User
   - Shows individual monthly performance

3. **Historical category comparison**:
   - Custom Date Range: Last month's dates
   - Category Filter: Running
   - View Mode: By Category
   - Compare with this month's running data

4. **Team performance**:
   - Time Period: All
   - View Mode: By User
   - Sort by team to see team-level participation

## Tips and Best Practices

### For Regular Reporting
1. Use consistent time periods (e.g., always export on Mondays)
2. Create templates from your exports for consistent formatting
3. Save exports with descriptive names including the date range

### For Data Analysis
1. Start with Overview mode to see trends
2. Use By Category mode to identify popular activities
3. Use By User mode to identify engagement levels
4. Combine filters to drill down into specific insights

### For Performance Reviews
1. Filter by individual user
2. Select a meaningful time period (month/quarter)
3. Export to Excel for detailed discussion
4. Compare across multiple time periods

### For Troubleshooting
- If no data appears: Check your filters and date range
- If export is disabled: Ensure there's data in your current view
- If charts are empty: Try expanding your date range or removing filters

## Technical Notes

### Data Refresh
- All data loads from the database in real-time
- Changes to filters trigger automatic data refresh
- No manual refresh needed

### Performance
- Large date ranges may take a few seconds to load
- Exports with many days create larger Excel files
- All filtering happens client-side for instant response

### Error Handling
- Invalid date ranges are prevented by the UI
- Empty data sets show friendly messages
- Export errors display an alert with retry option

## Support

For questions or issues with the Admin Dashboard, please contact your system administrator.
