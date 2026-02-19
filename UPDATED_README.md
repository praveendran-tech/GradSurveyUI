# Graduate Survey Data Management System - Complete

## Overview

A beautiful, modern React application for managing University of Maryland graduate survey data with UMD branding and comprehensive features.

## Access the Application

The development server is running at: **http://localhost:5173/**

## Application Structure

### 1. Landing Page (/)
**Beautiful Hero Section with UMD Branding**
- Red gradient header with Maryland flag pattern
- Welcome message explaining the system
- Two prominent action buttons:
  - **Data Management Dashboard** - Navigate to the main dashboard
  - **Download Reports** - Navigate to CSV export page
- Feature cards showcasing:
  - Multi-Source Data Integration
  - Student-Centric Dashboard
  - Custom Report Generation
- Hover animations and smooth transitions
- UMD colors (Red #E21833, Gold #FFD200)

### 2. Data Management Dashboard (/manage)
**Enhanced Student Data Interface**
- **Navigation**: Back button to home, Download Reports link
- **Header Section**: Gradient background with UMD colors
- **Filter Bar**: Styled with left border accent
  - Filter by Name, UID, Major, School, Term
  - Clean, responsive layout
- **Student Cards**:
  - Hover effects (lift on hover)
  - Expandable sections
  - "In Master DB" badges
  - Edit buttons for existing entries
- **Data Source Cards**:
  - Color-coded by source (Qualtrics: Blue, LinkedIn: LinkedIn Blue, ClearingHouse: Green)
  - Sourced timestamps
  - View detailed data
  - Select for master database
- **Add Manually**: Form for manual data entry
- Result counter badge

### 3. Download Page (/download)
**CSV Export Functionality**
- **Navigation**: Back to home, link to dashboard
- **Filter Options**:
  - All Students
  - By Major
  - By School
  - By Term
- **Export Summary Card**: Shows filtered count
- **CSV Export**: Downloads comprehensive report including:
  - Student information (Name, UID, Major, School, Term)
  - Data source availability
  - Master database status
  - Employment information
  - Enrollment information
  - Timestamps
- **Instructions Card**: Step-by-step guide
- Filename includes filter type and date

## Visual Design Features

### UMD Branding
- Primary Color: #E21833 (UMD Red)
- Secondary Color: #FFD200 (UMD Gold)
- Professional gradients and shadows
- Maryland flag pattern elements

### Modern UI Elements
- Smooth hover transitions
- Card elevations and shadows
- Gradient backgrounds
- Responsive design for all screen sizes
- Icon integration
- Professional typography
- Rounded corners and modern spacing

### Animations
- Button lift on hover
- Card scale effects
- Smooth page transitions
- Transform animations

## Technology Stack

- **React 19** with **TypeScript**
- **Material-UI v7** (MUI) - Component library
- **React Router v6** - Navigation and routing
- **PapaParse** - CSV generation
- **Vite** - Fast development and build tool
- **Emotion** - CSS-in-JS styling

## Running the Application

### Development Server
```bash
npm run dev
```
Access at: http://localhost:5173/

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Navigation Flow

```
Landing Page (/)
    ├── Data Management Dashboard (/manage)
    │   ├── View student data
    │   ├── Filter students
    │   ├── Select data sources
    │   ├── Add/Edit entries
    │   └── Navigate to Download (/download)
    │
    └── Download Reports (/download)
        ├── Select filter type
        ├── Choose specific value
        ├── Preview export summary
        └── Download CSV
```

## Sample Data

5 students with varying data configurations:
1. **John Smith** - All 3 data sources + master entry
2. **Sarah Johnson** - Qualtrics + ClearingHouse
3. **Michael Chen** - LinkedIn + ClearingHouse + master entry
4. **Emily Rodriguez** - Qualtrics only
5. **David Kim** - No data sources

## Features Implemented

✅ Beautiful landing page with UMD branding
✅ Hero section with gradient and pattern background
✅ Multi-page navigation with React Router
✅ Enhanced data management dashboard
✅ CSV download functionality with filters
✅ Hover animations and transitions
✅ Responsive design
✅ Professional color scheme
✅ Icon integration
✅ Back navigation on all pages
✅ Export summary and instructions

## Future Integration

When connecting to real backend:
1. Replace `mockData.ts` with API calls
2. Add authentication
3. Implement data persistence
4. Add loading states
5. Implement error handling
6. Add pagination for large datasets

## File Structure

```
src/
├── pages/
│   ├── LandingPage.tsx           # Home page with hero
│   ├── DataManagementPage.tsx    # Main dashboard
│   └── DownloadPage.tsx          # CSV export page
├── components/
│   ├── FilterBar.tsx             # Enhanced filter component
│   ├── StudentList.tsx           # List container
│   ├── StudentCard.tsx           # Expandable card with animations
│   ├── DataSourceCard.tsx        # Source cards with hover effects
│   ├── ViewDetailDialog.tsx      # Detail modal
│   ├── AddManuallyDialog.tsx     # Manual entry form
│   └── EditMasterDialog.tsx      # Edit form
├── types.ts                      # TypeScript interfaces
├── theme.ts                      # UMD color theme
├── mockData.ts                   # Sample data
└── App.tsx                       # Router configuration
```

## Commands Reference

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

---

**© 2026 University of Maryland. Graduate Survey Data Management System**
