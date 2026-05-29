# Plan: Implement Optimal Reading Layout (1440px Width)

To create a more expansive yet readable layout, I will implement a modern "Optimal Reading" grid. This expands the site's overall width to utilize modern large screens while ensuring long-form text remains within comfortable reading limits (preventing eye strain).

## Proposed Changes

### 1. Style Adjustments (`public/css/style.css`)
- **Global Container Expansion:** 
  - Increase `.container` `max-width` from `1200px` to `1440px`.
  - Set `width: 95%` to ensure responsiveness on ultra-wide screens.
- **Advanced Post Layout Grid:**
  - Update `.post-layout-container` to use a 3-part layout: 
    - `[Sidebar (280px)] [Main Content (Max 850px)] [Dynamic Buffer (Flexible)]`.
  - This centers the reading area visually while keeping the Table of Contents accessible on the left.
- **Enhanced Typography Spacing:**
  - Increase padding for the `.full-post` card to `4.5rem` (up from `3.5rem`) to provide more "breathing room" in the expanded space.
- **Hero & Featured Card Scaling:**
  - Ensure the Hero section and Featured Cards on the homepage scale naturally to fill the new 1440px width without feeling sparse.

## Expected Outcome
- The website will feel much more "premium" and spacious, filling the screen better as requested (the "8/10 parts" feel).
- Articles will follow international blog standards (Medium, Substack, etc.) where text width is strictly controlled for readability, but images and the container feel wide.
- High-resolution photos in articles will now be able to display at a larger, more impactful size.

## Validation Strategy
- Verify that the layout remains centered on ultra-wide monitors.
- Ensure the sidebar doesn't overlap or push content on smaller laptop screens (13-14 inch).
- Check that responsive breakpoints (@media queries) are still valid for mobile/tablet.
