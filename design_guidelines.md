# Fitness Consultancy Platform Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from fitness platforms like MyFitnessPal, Strava, and Nike Training Club, combined with professional dashboard designs like Linear and Notion for the admin interface.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (as specified in PRD):**
- Background: `207 29% 9%` (#0f172a - dark slate)
- Primary Blue: `215 91% 60%` (#3c83f6) 
- Text/Contrast: `0 0% 100%` (#ffffff)
- Secondary Gray: `215 25% 27%` (for cards/containers)
- Success Green: `142 71% 45%` (for active status)
- Warning Orange: `25 95% 53%` (for pending payments)
- Error Red: `0 84% 60%` (for inactive/overdue)

**Gradient Usage:**
- Hero section: Subtle gradient from primary blue to deeper blue-purple
- Card highlights: Soft blue-to-transparent gradients for premium feel
- Progress bars: Blue-to-cyan gradients for motivation

### B. Typography
**Primary Font:** Poppins (Google Fonts)
- Headlines: Poppins 600-700 (semibold-bold)
- Body text: Poppins 400-500 (normal-medium)
- UI elements: Poppins 500 (medium)
- Data/metrics: Poppins 600 (semibold for emphasis)

### C. Layout System
**Tailwind Spacing Units:** Consistent use of 2, 4, 6, 8, 12, 16, 24
- Micro spacing: `p-2, m-2` (8px)
- Standard spacing: `p-4, gap-4` (16px) 
- Section spacing: `py-8, my-8` (32px)
- Large spacing: `py-12, my-12` (48px)
- Hero/major sections: `py-16, py-24` (64px-96px)

### D. Component Library

**Navigation:**
- Sidebar navigation for admin (collapsible on mobile)
- Top navigation bar for students
- Breadcrumbs for deep navigation
- Clean, minimal tab navigation for content sections

**Cards & Containers:**
- Rounded corners: `rounded-lg` (8px)
- Subtle shadows: `shadow-lg` with dark theme adaptation
- Glass-morphism effect for premium sections
- Progress cards with visual indicators

**Forms:**
- Dark input fields with blue focus states
- Floating labels for modern feel
- File upload with drag-and-drop styling
- Multi-step forms for student onboarding

**Data Display:**
- Dashboard widgets with key metrics
- Progress charts using Recharts with blue theme
- Student grid/list toggle views
- Status badges with color coding

**Media Components:**
- Video player with custom dark controls
- PDF viewer integration
- Image galleries for progress photos
- Thumbnail grids for video libraries

### E. Layout Structure

**Landing Page (3 sections max):**
1. **Hero Section:** Full viewport with gradient background, value proposition, and subscription plan preview
2. **Benefits Section:** Three-column layout showcasing methodology benefits
3. **Pricing/CTA Section:** Plan comparison table with clear pricing and sign-up CTAs

**Admin Dashboard:**
- Left sidebar navigation
- Main content area with breadcrumbs
- Quick stats cards at top
- Tabbed content organization

**Student Portal:**
- Top navigation with user profile
- Dashboard cards for quick access
- Content areas with clear categorization
- Progress visualization prominence

## Images
**Hero Image:** Large background image of fitness/training environment with gradient overlay to ensure text readability. Position behind hero text with 60% opacity dark overlay.

**Section Images:** Lifestyle/fitness photos in benefit sections, team/coach photos for credibility, before/after transformation imagery (with permission) in testimonials.

**Dashboard Images:** Student profile photos, progress photos, video thumbnails, and iconography for different workout types.

## Key Design Principles
1. **Professional Fitness Aesthetic:** Clean, motivational, and trustworthy
2. **Data-Driven Interface:** Clear hierarchy for metrics and progress
3. **Content-First:** Video and PDF content should be prominently featured
4. **Mobile-Responsive:** Seamless experience across all devices
5. **Accessibility:** High contrast ratios maintained in dark theme