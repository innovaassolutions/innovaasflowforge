# Visual and Accessibility Testing Checklist

> Report Visual Transformation - Task 9
> Created: 2025-11-23

## Overview

This checklist ensures the report viewer page meets professional standards for visual design, accessibility, and cross-browser compatibility.

---

## 1. Browser Compatibility Testing

### Chrome
- [ ] Report loads without errors
- [ ] Charts render correctly (RadarChart, DimensionBarChart)
- [ ] All UI components display properly (ScoreBadge, CalloutBox, etc.)
- [ ] Download buttons function (PDF and Markdown)
- [ ] Lazy loading works (check Network tab for code splitting)
- [ ] Responsive layout works at different viewport sizes

### Firefox
- [ ] Report loads without errors
- [ ] Charts render correctly
- [ ] SVG elements display properly
- [ ] Download functionality works
- [ ] Colors match Chrome rendering
- [ ] Font rendering is acceptable

### Safari
- [ ] Report loads without errors (check Console for errors)
- [ ] Charts render correctly
- [ ] Gradient backgrounds display correctly
- [ ] Download triggers work (Safari sometimes blocks downloads)
- [ ] Touch interactions work (if testing on iOS)

**Notes:**
- Test with latest stable versions
- Note any browser-specific issues
- Verify no console errors in any browser

---

## 2. Responsive Design Testing

### Desktop (1920px)
- [ ] Layout uses full max-width (5xl = 1024px)
- [ ] Charts are clearly visible and properly sized
- [ ] Download buttons are visible in header
- [ ] No horizontal scrolling
- [ ] Whitespace is generous and professional

### Tablet (768px - 1024px)
- [ ] Header switches to column layout (flex-col)
- [ ] Charts remain readable
- [ ] MetricCard grid adjusts to 2 columns
- [ ] Download buttons stack or adjust appropriately
- [ ] No content overflow

### Mobile (375px - 767px)
- [ ] Single column layout throughout
- [ ] Charts are readable (check bar chart labels)
- [ ] Download buttons are easily tappable (44px min)
- [ ] Text is legible without zooming
- [ ] No horizontal scrolling
- [ ] Touch targets are adequately sized

**Test on actual devices if possible:**
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)

---

## 3. Keyboard Navigation Testing

### Tab Navigation
- [ ] Can tab through all interactive elements in logical order
- [ ] Focus indicators are visible on all elements
- [ ] Download buttons are keyboard accessible
- [ ] No keyboard traps
- [ ] Skip to main content works (if implemented)

### Keyboard Interactions
- [ ] Enter/Space activates buttons
- [ ] Esc closes any modals (if applicable)
- [ ] Arrow keys work in any interactive components
- [ ] Tab order matches visual layout

### Focus Management
- [ ] Focus is visible (not outline: none without alternative)
- [ ] Focus color has sufficient contrast
- [ ] Focus indicator is at least 2px thick
- [ ] Active element is clearly indicated

---

## 4. Color Contrast Verification

Use WebAIM Contrast Checker or browser DevTools:

### Text Contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- [ ] Body text on mocha-base background: `#cdd6f4` on `#1e1e2e`
- [ ] Headings on mocha-base background: `#cdd6f4` on `#1e1e2e`
- [ ] Subtext on backgrounds: `#a6adc8` and `#9399b2` variants
- [ ] Score colors are readable:
  - [ ] Green (#10b981) - passes
  - [ ] Yellow (#eab308) - passes
  - [ ] Orange (#f97316) - passes
  - [ ] Red (#ef4444) - passes
- [ ] Brand colors are readable:
  - [ ] Orange (#F25C05) on white
  - [ ] Teal (#1D9BA3) on backgrounds

### Interactive Element Contrast
- [ ] Button text on button backgrounds
- [ ] Download button text (white on brand-orange)
- [ ] Link colors (if any links present)
- [ ] Icon colors against backgrounds

### Chart Colors
- [ ] Radar chart fills and strokes
- [ ] Bar chart colors (traffic light system)
- [ ] Chart axis labels and grid lines
- [ ] Tooltip text and backgrounds

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Accessibility Panel
- WAVE Browser Extension

---

## 5. Screen Reader Testing

### VoiceOver (macOS/iOS)
- [ ] Page title is announced
- [ ] Section headings are announced correctly
- [ ] Score values are announced with context
- [ ] Chart descriptions are meaningful (aria-label, role="img")
- [ ] Download buttons announce their purpose
- [ ] Lists are announced as lists
- [ ] Navigation is logical and sequential

### NVDA (Windows)
- [ ] Similar to VoiceOver checks
- [ ] Tables (if any) are properly structured
- [ ] Form elements have proper labels

### JAWS (Windows) - if available
- [ ] Page structure is clear
- [ ] Landmarks are identified
- [ ] Interactive elements are accessible

### Screen Reader Checklist
- [ ] All images have alt text or aria-label
- [ ] Decorative elements have aria-hidden="true" or empty alt=""
- [ ] Charts have figcaption or aria-label
- [ ] Icon-only buttons have aria-label
- [ ] Complex visualizations have text alternatives
- [ ] No "click here" or non-descriptive link text

---

## 6. Download Functionality Testing

### PDF Download
- [ ] Click PDF button triggers download
- [ ] Filename is descriptive and includes:
  - Company name (sanitized)
  - Campaign name (sanitized)
  - Date (YYYY-MM-DD)
  - Token prefix (first 8 chars)
  - `.pdf` extension
- [ ] PDF opens correctly
- [ ] PDF content matches web view
- [ ] PDF is properly formatted
- [ ] No download errors in console

### Markdown Download
- [ ] Click Markdown button triggers download
- [ ] Filename follows same pattern with `.md` extension
- [ ] Markdown file has valid formatting
- [ ] Headers, lists, and structure are correct
- [ ] Content matches report data
- [ ] No download errors in console

### Download Edge Cases
- [ ] Multiple rapid clicks don't cause issues
- [ ] Download works with long company/campaign names
- [ ] Download works with special characters in names
- [ ] Disabled state shows while downloading
- [ ] Error handling works if API fails

---

## 7. Report Tier Testing

Test with all three tier levels:

### Basic Tier
- [ ] Overall score displays
- [ ] Executive summary shows
- [ ] Pillar scores display
- [ ] Dimension scores show (no key findings)
- [ ] No stakeholder quotes
- [ ] No recommendations section
- [ ] Key themes are hidden

### Informative Tier
- [ ] All Basic tier content shows
- [ ] Key findings display for each dimension
- [ ] Stakeholder quotes appear (max 2 per dimension)
- [ ] Key themes section displays
- [ ] Recommendations section shows
- [ ] "Path to Next Level" callouts appear

### Premium Tier
- [ ] All Informative tier content shows
- [ ] Full stakeholder perspectives
- [ ] Contradictions section (if applicable)
- [ ] Complete recommendations with next steps
- [ ] All charts and visualizations present

### Tier-Specific Checks
- [ ] Conditional rendering works correctly
- [ ] No leaked content from higher tiers
- [ ] No errors when content is missing
- [ ] Empty states handle gracefully

---

## 8. Visual Quality Checks

### Typography
- [ ] Font hierarchy is clear (h1 > h2 > h3 > body)
- [ ] Line height is comfortable (1.5-1.8 for body text)
- [ ] Font sizes are readable (minimum 14px for body)
- [ ] Text doesn't overflow containers
- [ ] No orphaned headings

### Layout & Spacing
- [ ] Consistent spacing between sections (space-y-8)
- [ ] Padding is generous (p-6, p-8)
- [ ] No cramped content
- [ ] Visual hierarchy guides the eye
- [ ] Related content is visually grouped

### Colors & Branding
- [ ] Mocha theme colors are consistent
- [ ] Brand orange (#F25C05) used for primary actions
- [ ] Brand teal (#1D9BA3) used for secondary elements
- [ ] Gradient header is visually appealing
- [ ] Score badge gradients work correctly

### Charts & Visualizations
- [ ] Radar chart is centered and appropriately sized
- [ ] Bar charts are readable (not too tall or short)
- [ ] Chart colors match traffic light system
- [ ] Chart labels don't overlap
- [ ] Tooltips display on hover
- [ ] Charts are responsive

### Components
- [ ] ScoreBadge sizes are appropriate (sm/md/lg/xl)
- [ ] CalloutBoxes stand out but aren't overwhelming
- [ ] PriorityTags use semantic colors
- [ ] MetricCards align in grid properly
- [ ] QuoteCards have clear attribution

---

## 9. Performance Testing

### Page Load
- [ ] Initial load completes in <3 seconds
- [ ] Lazy loading defers chart rendering
- [ ] Suspense fallbacks display during loading
- [ ] No layout shift after charts load
- [ ] No flash of unstyled content

### Runtime Performance
- [ ] Smooth scrolling
- [ ] No lag when interacting with elements
- [ ] Charts render smoothly
- [ ] No memory leaks (check DevTools Memory tab)

### Bundle Size
- [ ] Recharts is code-split (check Network tab)
- [ ] Chart components load only when needed
- [ ] No duplicate dependencies

---

## 10. Issues Found & Resolutions

| Issue # | Description | Severity | Status | Resolution |
|---------|-------------|----------|--------|------------|
| Example | Chart labels overlap on mobile | Medium | ❌ Open | Need to adjust font-size |

**Severity Levels:**
- **Critical**: Breaks functionality or makes content inaccessible
- **High**: Significant usability or accessibility issue
- **Medium**: Noticeable issue but has workaround
- **Low**: Minor visual inconsistency

---

## Acceptance Criteria

All items must be checked before considering Task 9 complete:

- [ ] All browser tests pass (Chrome, Firefox, Safari)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Keyboard navigation is fully functional
- [ ] Color contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Screen readers can access all content
- [ ] PDF and Markdown downloads work correctly
- [ ] All three tiers display correctly
- [ ] No critical or high-severity issues remain
- [ ] Performance targets met (<3s load time)

---

## Testing Tools Used

- [ ] Chrome DevTools (Lighthouse, Accessibility Panel)
- [ ] Firefox DevTools
- [ ] Safari Web Inspector
- [ ] WebAIM Contrast Checker
- [ ] WAVE Browser Extension
- [ ] VoiceOver (macOS)
- [ ] NVDA or JAWS (Windows)
- [ ] Actual mobile devices

---

## Notes

Add any additional observations, recommendations, or context here:

```
[Testing notes go here]
```
