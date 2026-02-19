# Graduate Survey Data Management UI

A React TypeScript application for managing graduate survey data from multiple sources (Qualtrics, LinkedIn, ClearingHouse).

## Features

### 1. Filter Bar
Located at the top of the page, allows filtering students by:
- Name
- UID (University ID)
- Major
- School
- Term

All filters work with partial text matching and are case-insensitive.

### 2. Student List
Displays filtered students in expandable cards showing:
- Student name, UID, major, school, and term
- "In Master DB" badge if student data is already in the master database
- Edit button for students with existing master data

### 3. Expandable Student Cards
Click the expand icon to view:
- **Data Source Cards**: Up to 3 cards showing available data from:
  - **Qualtrics Survey** (Blue accent)
  - **LinkedIn Profile** (LinkedIn Blue accent)
  - **ClearingHouse Record** (Green accent)

Each data source card includes:
- Source name and summary information
- Sourced timestamp showing when data was collected
- **View button**: Opens a detailed dialog showing all data
- **Select button**: Selects this source to populate the master database

### 4. View Detail Dialogs
Clicking "View" on any data source card opens a modal showing:
- **Qualtrics**: Survey ID and all survey responses
- **LinkedIn**: Positions (title, company, dates, description) and education records
- **ClearingHouse**: Enrollment records (institution, degree, major, status, dates)

### 5. Select Functionality
Clicking "Select" on a data source card:
- Automatically populates the master database with data from that source
- Marks the card as "Selected" with a badge
- Adds "In Master DB" badge to the student card
- Shows the Edit button for future modifications

### 6. Add Manually Dialog
Located at the bottom of each expanded student card:
- Opens a form to manually enter student data
- Fields include:
  - Employment Status (dropdown)
  - Current Employer
  - Current Position
  - Enrollment Status (dropdown)
  - Current Institution
- Use when data sources don't have the information or you want to enter custom data

### 7. Edit Master Entry
For students already in the master database:
- Edit button (pencil icon) appears next to the student name
- Opens the same form as "Add Manually" but pre-populated with existing data
- Updates the master database entry while preserving the selected source

## Color Palette

The UI uses the University of Maryland official colors:
- **Primary**: UMD Red (#E21833)
- **Secondary**: UMD Gold/Yellow (#FFD200)
- **Text**: Dark Gray (#2C2C2C)
- **Background**: White (#FFFFFF) with light gray (#F5F5F5) accents

## Running the Application

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The application will be available at http://localhost:5173/

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Mock Data

The application includes 5 sample students with various data configurations:
1. **John Smith** - Has Qualtrics, LinkedIn data, and master entry (LinkedIn selected)
2. **Sarah Johnson** - Has Qualtrics and ClearingHouse data (no master entry)
3. **Michael Chen** - Has LinkedIn and ClearingHouse data with master entry
4. **Emily Rodriguez** - Has only Qualtrics data (no master entry)
5. **David Kim** - Has no data from any source

This variety demonstrates all UI states and functionalities.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Vite** - Build tool and dev server
- **Emotion** - CSS-in-JS styling (required by MUI)

## Project Structure

```
src/
├── components/
│   ├── FilterBar.tsx          # Top filter controls
│   ├── StudentList.tsx        # List container component
│   ├── StudentCard.tsx        # Expandable student card
│   ├── DataSourceCard.tsx     # Individual data source cards
│   ├── ViewDetailDialog.tsx   # Modal for viewing full data
│   ├── AddManuallyDialog.tsx  # Form for manual entry
│   └── EditMasterDialog.tsx   # Form for editing master data
├── types.ts                   # TypeScript interfaces
├── theme.ts                   # MUI theme with UMD colors
├── mockData.ts                # Sample student data
├── App.tsx                    # Main application component
└── main.tsx                   # Application entry point
```

## Future Enhancements

When connected to real APIs, you would:
1. Replace `mockData.ts` with API calls
2. Add authentication
3. Implement data persistence for master database selections
4. Add loading states and error handling
5. Implement pagination for large student lists
6. Add export functionality for master database
7. Include data validation and conflict resolution
