# CSS Philosophy: Radical Simplification

This document describes our CSS architecture philosophy: aggressive consolidation to maintain a small, consistent core.

## Core Principle

**Question everything. Delete ruthlessly. Consolidate aggressively.**

Most CSS complexity comes from cargo-culted patterns that aren't actually needed. When in doubt, try deleting it first.

## Guidelines

### 1. Delete Entire CSS Files When Possible

Before creating a component-specific CSS file, ask: "Is there anything here that can't be handled by global styles?"

**Delete the file if:**
- All styles are just wrappers around existing patterns
- Everything could be achieved with 1-2 CSS variables
- The "unique" layout is just a max-width or padding adjustment

**Component CSS files should be rare.** Most components need zero custom CSS.

### 2. Consolidate Duplicate Patterns Aggressively

If you see similar classes differing only in color/spacing/one property, merge them with variants:

```css
/* Bad: Three separate classes for similar purposes */
.dashboard-loading { /* card with blue heading */ }
.dashboard-error { /* card with red heading */ }
.empty-state { /* card with gray heading */ }

/* Good: One pattern with variants */
.status-message { /* base card */ }
.status-message.info { /* blue */ }
.status-message.error { /* red */ }
```

**Look for:** Classes with identical structure but different colors, sizes, or minor variations. Merge them.

### 3. Question Arbitrary Constraints

**Max-widths, specific pixel values, and breakpoints should have clear justification.**

Ask: "Why is this 600px instead of using the global max-width? Why does this need to be different?"

Often the answer is "no good reason" → delete the constraint.

```css
/* Bad: Arbitrary limitation */
.form-container {
  max-width: 800px; /* Why 800px? Why not global 1200px? */
}

/* Good: Use global constraint or no constraint */
.form-container {
  /* Let it use the global max-width from <main> */
}
```

### 4. Don't Create Size-Based Utilities

Avoid: `.container-sm`, `.container-md`, `.container-lg`

These obscure **why** different sizes exist. Think semantically:
- What is this content?
- Why does it need different width than other content?
- Could it just use the default width?

Most of the time, content doesn't need special sizing.

### 5. Use CSS Variables for Contextual Theming

Instead of specific selectors, use CSS variables with fallbacks for context-aware styling:

```css
/* Global default */
button {
  background: var(--button-bg, var(--color-primary));
}

/* Context override - no new selectors needed */
.dashboard-header {
  --button-bg: rgba(255, 255, 255, 0.2);
}
```

Buttons inside `.dashboard-header` automatically get the transparent styling. No specificity wars.

### 6. Mobile-First Always

Write base styles for mobile, enhance for desktop:

```css
/* Bad: Desktop-first */
.toolbar {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }
}

/* Good: Mobile-first */
.toolbar {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    justify-content: space-between;
  }
}
```

### 7. Eliminate Redundant Responsive Queries

If a media query sets the exact same values as the base styles, **delete it entirely**:

```css
/* Bad: Useless media query */
.tab {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

@media (min-width: 600px) {
  .tab {
    padding: 0.75rem 1.5rem;  /* Same as base! */
    font-size: 1rem;          /* Delete this query */
  }
}
```

### 8. Push Common Patterns to Global Scope

If you're writing the same pattern twice, it belongs in `index.css`:

```css
/* If you find yourself repeating this pattern... */
.status-message { /* in index.css */ }
.instructions { /* in index.css */ }
.page-header { /* in index.css */ }

/* ...not scattered across component files */
```

Global patterns make the whole app consistent by default.

### 9. Merge State Patterns

Loading, error, empty, success states are usually the same container with different colors. Use one pattern:

```css
.status-message { /* base */ }
.status-message.success { /* green */ }
.status-message.error { /* red */ }
.status-message.info { /* blue */ }
```

Don't create `.loading-spinner`, `.error-card`, `.empty-state` if they're all just colored boxes.

## Red Flags

Watch for these signs of cargo-cult CSS:

- 🚩 Component CSS file with < 20 lines (probably deletable)
- 🚩 Multiple classes that look nearly identical
- 🚩 Arbitrary max-widths (600px, 800px, etc.) without clear purpose
- 🚩 Media queries that don't change anything
- 🚩 `.container-sm`, `.size-md`, `.width-lg` naming
- 🚩 Wrapper divs just to add a class (`.form-group`, `.card-wrapper`)
- 🚩 Repeating the same pattern across files

When you see these: stop, question, consolidate or delete.

## Summary

**The goal is a tiny, consistent CSS core.**

- Most components need **zero custom CSS**
- Common patterns live in `index.css`
- Component files are rare and truly unique
- Consolidate similar patterns aggressively
- Delete arbitrary constraints
- Question everything, especially if it feels like boilerplate

When you finish styling something, try to delete half of it. You probably can.
