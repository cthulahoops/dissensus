# CSS Philosophy: Consolidation & Context-Aware Defaults

This document describes the CSS architecture philosophy expressed in the `css_clean` refactoring.

## Overview

This refactoring demonstrates a **"global defaults with contextual overrides"** approach to CSS architecture. The key insight: write styles once at the global level, then use CSS variables to enable context-specific theming without selector specificity wars.

## Core Principles

### 1. Push Common Styles to Global Scope

Instead of repeating styles in component-specific CSS files, move shared patterns to `index.css`:

**Before (component-specific):**
```css
/* SleepForm.css */
.form-group label {
  display: block;
  margin-bottom: calc(var(--spacing-md) * 0.5);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: calc(var(--spacing-md) * 0.75) var(--spacing-md);
  border: 1px solid var(--color-border);
}
```

**After (global):**
```css
/* index.css */
label {
  display: block;
  font-weight: 600;
}

input, textarea, select {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: var(--input-border);
  background: var(--input-bg, var(--color-background));
}
```

### 2. CSS Variables for Contextual Theming

Use CSS variables with fallbacks to allow local contexts to override global defaults:

**Pattern:**
```css
/* index.css - global default */
button {
  background: var(--button-bg, var(--color-primary));
}

input {
  background: var(--input-bg, var(--color-background));
  border: var(--input-border);
}
```

**Context override:**
```css
/* Dashboard.css - gradient header context */
.dashboard-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));

  /* Override button/input appearance for white-on-gradient theme */
  --button-bg: rgba(255, 255, 255, 0.2);
  --input-bg: rgba(255, 255, 255, 0.1);
  --input-border: 1px solid rgba(255, 255, 255, 0.1);
}
```

This means buttons and inputs inside `.dashboard-header` automatically get the translucent white styling without needing `.dashboard-header button` selectors!

### 3. Semantic Utility Classes Over Layout-Specific Ones

Replace narrowly-defined utilities with more flexible, semantic alternatives:

**Before:**
```css
/* Old: Describes the layout implementation */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .flex-between {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
```

**After:**
```css
/* New: Describes the purpose - a toolbar that adapts */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  text-align: center;
}

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  /* Smart: single child aligns to end */
  .toolbar:has(> :first-child:last-child) {
    justify-content: flex-end;
  }
}
```

This is **mobile-first** (column by default) and intelligently handles edge cases.

### 4. Margin Collapse Management

Use first/last child selectors to prevent awkward spacing in containers:

```css
.dashboard-header > *:first-child {
  margin-top: 0;
}

.dashboard-header > *:last-child {
  margin-bottom: 0;
}
```

This allows child elements (h1, p, div, buttons) to have their own margin rules while preventing double-spacing at container edges.

### 5. Eliminate Component-Specific Files When Possible

**Deleted entirely:** `SleepForm.css` (75 lines)

**Trimmed down:** `SleepDashboard.css` from 71 lines to 37 lines

The philosophy: If styles aren't specific to a component's unique layout, they belong in the global stylesheet. Component CSS files should only exist for truly unique layouts/patterns.

### 6. Remove HTML Structure Dependencies

**Before:** Two-column form layout required wrapping div:
```tsx
<div className="form-row">  {/* Grid container */}
  <div className="form-group">...</div>
  <div className="form-group">...</div>
</div>
```

**After:** Flat structure, let forms flow naturally:
```tsx
<div className="form-group">...</div>
<div className="form-group">...</div>
```

This simplifies the HTML and relies on global form spacing rather than layout wrappers.

### 7. Semantic HTML Over Styling Hacks

**Changed:**
```tsx
// Before: Paragraph used for non-paragraph content
<p>Tracking {sleepRecords.length} total records</p>

// After: Generic container is more semantically correct
<div>Tracking {sleepRecords.length} total records</div>
```

This prevents inheriting unwanted paragraph styling and is more semantically appropriate for UI text.

## Benefits

1. **Reduced Duplication**: Net -115 lines of CSS code
2. **Easier Theming**: Change CSS variables in one place, affect all children
3. **Lower Specificity**: No need for `.parent .child` selectors
4. **Better Maintainability**: New components automatically inherit design system
5. **Mobile-First**: Responsive design baked into utilities
6. **Composability**: Mix and match classes naturally

## Summary

**"Write once, theme anywhere, compose naturally"**

- Global element styles handle 80% of cases
- CSS variables enable contextual theming without selector specificity wars
- Utility classes describe purpose, not implementation
- Component CSS files are rare and contain only truly unique layouts
- Mobile-first responsive design baked into utilities
- Semantic HTML + minimal classes = maintainable code

This approach makes it trivial to add new components that automatically inherit the design system while still allowing contextual customization where needed.
