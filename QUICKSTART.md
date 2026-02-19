# Graduate Survey Data Management - Quick Start

## Application is Running!

Your development server is now running at: **http://localhost:5173/**

Open this URL in your browser to see the UI.

## What You Can Do

### 1. Use the Filters
At the top of the page, you'll see 5 filter fields. Try filtering by:
- Name: Type "John" or "Sarah"
- Major: Type "Computer" or "Business"
- Term: Type "Spring" or "Fall"

### 2. Expand Student Cards
Click the down arrow on any student card to see:
- Available data sources (Qualtrics, LinkedIn, ClearingHouse)
- Each card shows a summary and sourced timestamp

### 3. View Detailed Data
Click the "View" button on any data source card to see full details

### 4. Select a Data Source
Click "Select" on a data source card to add it to the master database
- The card will show a "Selected" badge
- The student will show "In Master DB" badge
- An edit button will appear

### 5. Add Manual Entry
Click "Add Manually" to enter data not available from sources

### 6. Edit Existing Entries
For students with master data, click the pencil icon to edit

## Sample Students

The app includes 5 sample students:

1. **John Smith** - Has all 3 data sources + master entry
2. **Sarah Johnson** - Has Qualtrics + ClearingHouse
3. **Michael Chen** - Has LinkedIn + ClearingHouse + master entry
4. **Emily Rodriguez** - Has only Qualtrics
5. **David Kim** - No data from any source

## Commands

```bash
# Stop the server (Ctrl+C in terminal)

# Restart the server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 19 with TypeScript
- Material-UI v7
- Vite (fast dev server and build tool)
- UMD color palette (Red #E21833)

## Need Help?

See `UI_README.md` for detailed documentation about all features and components.
