# TaMaD Design System Guide

Welcome to the TaMaD comprehensive design system! This guide covers all available design components, themes, textures, colors, and layout options.

## Table of Contents

1. [Color Themes](#color-themes)
2. [Components](#components)
3. [Card Styles](#card-styles)
4. [Button Styles](#button-styles)
5. [Textures & Patterns](#textures--patterns)
6. [Layout & Alignment](#layout--alignment)
7. [Typography](#typography)
8. [Spacing](#spacing)
9. [Usage Examples](#usage-examples)

---

## Color Themes

### Available Themes

1. **Indigo (Default)** - Professional and sophisticated
   - Primary: #6366f1
   - Secondary: #8b5cf6
   - Accent: #a78bfa

2. **Ocean** - Cool and calming
   - Primary: #00d4ff
   - Secondary: #00e5ff
   - Accent: #0fb9db

3. **Forest** - Natural and fresh
   - Primary: #20d9a3
   - Secondary: #13c68c
   - Accent: #2de0a5

4. **Sunset** - Warm and energetic
   - Primary: #ff6b4a
   - Secondary: #ff8866
   - Accent: #ff9933

5. **Mint** - Fresh and vibrant
   - Primary: #00e5a0
   - Secondary: #00d4a0
   - Accent: #2df5b5

6. **Neon** - Bold and modern
   - Primary: #ff00ff
   - Secondary: #ff33ff
   - Accent: #ff66ff

### How to Switch Themes

```javascript
import { useTheme } from "./utils/themes";

export default function MyComponent() {
  const { setTheme } = useTheme();

  return (
    <button onClick={() => setTheme("ocean")}>Switch to Ocean Theme</button>
  );
}
```

### Color Palette

- **Success**: #34d399
- **Error**: #f87171
- **Warning**: #fbbf24
- **Info**: #60a5fa

---

## Components

### Design Components

The app includes reusable design components in `src/components/DesignComponents.jsx`:

- **Badge** - Display tags and labels
- **Button** - Multiple button variants
- **Card** - Container with various styles
- **StatCard** - Display metrics
- **SectionHeader** - Section titles
- **GradientText** - Gradient text effects
- **Divider** - Visual separators
- **InfoBox** - Information containers

### Usage Example

```jsx
import { Card, Button, Badge } from "../components/DesignComponents";

export default function Component() {
  return (
    <Card variant="glass">
      <Badge variant="solid">New</Badge>
      <h3>My Card</h3>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

---

## Card Styles

### Available Card Styles

1. **card** - Standard solid card with border
2. **card-glass** - Frosted glass effect
3. **card-gradient** - Gradient background
4. **card-neon** - Bold colored border
5. **card-minimal** - Minimal with transparent background

### Usage

```jsx
<div className="card-glass p-6 rounded-2xl">
  Glass card content
</div>

<div className="card-gradient p-6 rounded-2xl">
  Gradient card content
</div>

<div className="card-neon p-6 rounded-2xl">
  Neon card content
</div>
```

---

## Button Styles

### Available Button Variants

1. **btn-primary** - Primary gradient button
2. **btn-secondary** - Secondary gradient button
3. **btn-ghost** - Subtle background button
4. **btn-outline** - Border-only button
5. **btn-text** - Text-only button

### Usage

```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-outline">Outline</button>
<button className="btn-text">Text</button>
```

### Button Sizes

```jsx
<button className="btn-primary text-xs px-2 py-1">Small</button>
<button className="btn-primary">Medium (default)</button>
<button className="btn-primary px-6 py-3 text-lg">Large</button>
```

---

## Textures & Patterns

### Available Textures

1. **texture-noise** - Subtle noise pattern
2. **texture-grid** - Grid pattern
3. **texture-dots** - Dot pattern
4. **texture-stripes** - Stripe pattern

### Usage

```jsx
<div className="card texture-noise p-6">
  Content with noise texture
</div>

<div className="card texture-grid p-6">
  Content with grid texture
</div>

<div className="card texture-dots p-6">
  Content with dots texture
</div>
```

---

## Layout & Alignment

### Alignment Classes

- **align-center** - Center both horizontally and vertically
- **align-center-h** - Center horizontally
- **align-center-v** - Center vertically
- **align-between** - Space between (justify-content: space-between)
- **align-around** - Space around (justify-content: space-around)

### Usage

```jsx
<div className="align-center">Centered content</div>
<div className="align-between">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Grid Layouts

```jsx
<div className="grid-auto-fit">
  {/* Auto-fitting grid with 300px min columns */}
</div>

<div className="grid-flow">
  {/* CSS grid with auto flow */}
</div>
```

### Gap Utilities

- **gap-xs**: 0.5rem (8px)
- **gap-sm**: 1rem (16px)
- **gap-md**: 1.5rem (24px)
- **gap-lg**: 2rem (32px)
- **gap-xl**: 3rem (48px)

---

## Typography

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

### Font Weights

- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Font Family

- Default: 'DM Sans' (body and UI)
- Special: 'Syne' (headings - when available)

---

## Spacing

### Standard Spacing Scale

- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)
- **2xl**: 4rem (64px)

### Usage

```jsx
<div className="p-6">Padding</div>
<div className="m-4">Margin</div>
<div className="gap-4">Gap between flex children</div>
```

---

## Usage Examples

### Example 1: Card with Badge

```jsx
import { Card, Badge, Button } from "../components/DesignComponents";

export default function TaskCard() {
  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Task Title</h3>
          <p className="text-sm text-slate-400">Task description</p>
        </div>
        <Badge variant="solid" size="sm">
          High
        </Badge>
      </div>
      <Button variant="primary">Complete Task</Button>
    </Card>
  );
}
```

### Example 2: Stat Cards Grid

```jsx
import { StatCard } from "../components/DesignComponents";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={CheckCircle2}
        label="Completed"
        value="24"
        color="emerald"
      />
      <StatCard icon={Clock} label="In Progress" value="8" color="blue" />
      <StatCard icon={AlertTriangle} label="Overdue" value="2" color="red" />
    </div>
  );
}
```

### Example 3: Custom Layout

```jsx
export default function CustomLayout() {
  return (
    <div className="align-between gap-6 texture-grid card p-8 rounded-2xl">
      <div className="align-center">
        <h2 className="gradient-text text-2xl font-bold">
          Welcome to Design System
        </h2>
      </div>
      <div className="align-around">
        <button className="btn-primary">Button 1</button>
        <button className="btn-secondary">Button 2</button>
      </div>
    </div>
  );
}
```

### Example 4: Using Themes

```jsx
import { useTheme, themes, designPresets } from "../utils/themes";

export default function ThemeExample() {
  const { setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {Object.values(themes).map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className="btn-ghost"
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Design Presets

### Available Presets

1. **modern** - Glass cards with noise texture
2. **minimal** - Minimal design, no textures
3. **vibrant** - Neon cards with grid texture
4. **elegant** - Gradient cards with dots
5. **neo** - Neon cards with stripes

Access presets:

```javascript
import { designPresets } from "./utils/themes";

const preset = designPresets.modern;
```

---

## Best Practices

1. **Consistency**: Use the same card and button styles throughout similar sections
2. **Contrast**: Ensure text has sufficient contrast against backgrounds
3. **Spacing**: Use the spacing scale for consistent padding and margins
4. **Colors**: Use semantic colors (success, error, warning, info) appropriately
5. **Textures**: Don't overuse textures - use them to add visual interest, not clutter
6. **Responsive**: Test designs on mobile, tablet, and desktop views

---

## Color Accessibility

- Primary text: #e2e8f0 (high contrast on dark backgrounds)
- Secondary text: #94a3b8 (good contrast for descriptions)
- Borders: rgba(255, 255, 255, 0.08) (subtle but visible)
- Status colors have enough contrast for accessibility

---

## Animation Classes

- **float** - Floating animation (3s loop)
- **glow-pulse** - Pulsing glow effect (2s loop)
- **shimmer** - Shimmer animation (1.5s loop)
- **slide-in-left** - Slide from left
- **slide-in-right** - Slide from right
- **slide-in-up** - Slide from bottom
- **fade-in** - Fade in
- **scale-in** - Scale and fade in

```jsx
<div className="animate-float">Floating element</div>
<div className="animate-glow-pulse">Glowing element</div>
```

---

## Need Help?

- Check the Design Showcase page at `/design-showcase`
- Review component examples in `src/pages/DesignShowcase.jsx`
- View reusable components in `src/components/DesignComponents.jsx`
- Access theme configs in `src/utils/themes.js`

Happy designing! 🎨
