# TripMate Design Spec

Figma: https://www.figma.com/community/file/1475450425488505290
App Type: Mobile App (iOS/Android), 375px base

---

## Color System

### Primary (Blue - Brand Color)
- Weak 50:    #EEF0FA  (background, subtle)
- Default 700: #3F52B4  (buttons, links, CTA, icons)
- Pressed 900: #323D76  (hover/pressed state)

### Secondary (Pink/Magenta)
- Weak 50:    #FCEEF3  (background)
- Default 700: #B22459  (badges, accent buttons)
- Pressed 900: #7A1A3D  (hover/pressed state)

### Semantic
- Success: #1A7A4A
- Warning: #B25A1A
- Error:   #B21A1A
- Info:    #1A4AB2

### Neutral
- Background:     #FFFFFF
- Background Alt: #F5F5F5
- Border:         #9C9FAF
- Text Primary:   #1E1E1E
- Text Secondary: #6B6B6B

---

## Typography

Font: Inter (Google Fonts - free)
https://fonts.google.com/specimen/Inter

CSS import:
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

Type Scale:
- H1:   28px / 700 Bold    - Main title
- H2:   24px / 700 Bold    - Section heading
- H3:   20px / 700 Bold    - Card title
- H4:   18px / 500 Medium  - Sub heading
- B1:   16px / 400~700     - Body large
- B2:   14px / 400~700     - Body medium
- B3:   12px / 400~600     - Body small
- Btn1: 16px / 600 Semi    - Large button
- Btn2: 14px / 600 Semi    - Small button
- L1:   12px / 600 Semi    - Label/Tag
- L2:   10px / 600 Semi    - Small label

---

## Spacing

Base unit: 4px
Page horizontal padding: 16px
Section gap: 24px
Card inner padding: 12-16px
Button height large: 48px
Button height medium: 40px
Button height small: 32px

### Border Radius
- Button:     12px
- Card:       16px
- Input:      12px
- Tag/Chip:   999px (pill)
- Icon Button: 50% (circle)

### Shadow
Card:   box-shadow: 0 2px 12px rgba(0,0,0,0.08);
Button: box-shadow: 0 4px 12px rgba(63,82,180,0.3);

---

## Components

### Primary Button
background: #3F52B4;
color: #FFFFFF;
border-radius: 12px;
height: 48px;
font-size: 16px;
font-weight: 600;

### Outline Button
background: transparent;
border: 1.5px solid #3F52B4;
color: #3F52B4;
border-radius: 12px;
height: 48px;

### Tour Card
Structure:
  [Full-width image]
  [Badge tag - #B22459]
  ----------------------
  Star rating | Bookmark
  Title (H3)
  Subtitle / Location (B2)
  Duration | People count
  from $700/person  <- #3F52B4

### Search Bar
background: #F5F5F5;
border-radius: 12px;
height: 48px;
padding: 0 16px;
Search icon on left side

### Bottom Navigation
Tabs: Explore | Save | Map | Profile
Active: #3F52B4
Inactive: #9C9FAF
Height: 64px + Safe Area

### Category Chip (selected)
background: #3F52B4;
color: white;
border-radius: 999px;
padding: 6px 16px;
font-size: 12px; font-weight: 600;

### Category Chip (unselected)
background: #F5F5F5;
color: #6B6B6B;

---

## Screens

1. Splash/Welcome
   - TripMate logo centered
   - White background + light blue gradient

2. Onboarding (4 screens)
   - Slide format, large image top
   - Title(H2) + description(B1) + dot indicator
   - Skip button top-right, Next/GetStarted bottom-right
   - Screen1: Find Your Dream Adventure Here
   - Screen2: Easily Save Your Favorite Journeys
   - Screen3: Plan Your Dream Trip With TripMate
   - Screen4: Location permission request

3. Auth (Login / Sign Up)
   - Social login: Google, Facebook, Apple
   - Email + password form
   - Error state: red border + error message
   - Divider: 'or' text

4. Explore (Home)
   - Top: location search bar
   - Filter tabs (Yours / Special Offers)
   - Sections: Nature Escapes, Wine Tours (full banner),
     Adventure Travel (2-col grid), Food Tourism, Blogs

5. Search
   - 3 step input: Where / When / Who
   - Autocomplete destination list
   - Calendar date picker
   - Traveler count (Adults/Children/Infants)

6. Tour Detail
   - Full-bleed hero image (back + heart overlay)
   - Tour name, rating, duration, location
   - Tabs: About | Itinerary | Stay
   - About: highlights, weather, reviews
   - Itinerary: day-by-day schedule + map
   - Stay: accommodation + gallery + nearby

7. Book Now
   - Tour summary card
   - Contact info form
   - Payment: Card / Apple Pay / Google Pay
   - Confirm & Pay CTA button

8. Save
   - Saved tours by category
   - Empty state: illustration + guide text

9. Plan
   - Create/manage trip plan
   - Day-by-day timeline

10. Account/Profile
    - Profile edit
    - Booking history
    - Settings menu
    - Logout confirm dialog

---

## Screenshots
See design-screenshots/ folder:
- 01-onboarding.png
- 02-login.png
- 03-explore.png
- 04-detail.png
- 05-search.png
- 06-book.png