# Quick Reference - TaMaD Design System

## 🎨 Themes (6 Options)

```css
data-theme="ocean"      /* Ocean Blue */
data-theme="forest"     /* Forest Green */
data-theme="sunset"     /* Warm Orange */
data-theme="mint"       /* Fresh Mint */
data-theme="neon"       /* Neon Purple */
/* Default: Indigo */
```

## 🎴 Card Styles (5 Variants)

```jsx
<div className="card">                    {/* Standard */}
<div className="card-glass">              {/* Frosted glass */}
<div className="card-gradient">           {/* Gradient bg */}
<div className="card-neon">               {/* Neon border */}
<div className="card-minimal">            {/* Transparent */}
```

## 🔘 Button Styles (5 Variants)

```jsx
<button className="btn-primary">      {/* Main action */}
<button className="btn-secondary">    {/* Secondary */}
<button className="btn-ghost">        {/* Subtle */}
<button className="btn-outline">      {/* Border only */}
<button className="btn-text">        {/* Text only */}
```

## 🏷️ Badges (Variants)

```jsx
<span className="badge">                {/* Default */}
<span className="badge-solid">          {/* Filled */}
<span className="badge-outline">        {/* Border */}
<span className="badge-sm">            {/* Small */}
<span className="badge-lg">            {/* Large */}
```

## 📋 Status & Priority

```jsx
<span className="priority-low">       {/* Low priority */}
<span className="priority-medium">    {/* Medium priority */}
<span className="priority-high">      {/* High priority */}
<span className="priority-urgent">    {/* Urgent priority */}

<span className="status-todo">        {/* To do */}
<span className="status-in_progress"> {/* In progress */}
<span className="status-done">        {/* Done */}
<span className="status-cancelled">   {/* Cancelled */}
```

## 🖼️ Textures (4 Options)

```jsx
<div className="texture-noise">       {/* Subtle noise */}
<div className="texture-grid">        {/* Grid pattern */}
<div className="texture-dots">        {/* Dot pattern */}
<div className="texture-stripes">     {/* Stripe pattern */}
```

## 📐 Layouts & Alignment

```jsx
<div className="align-center">        {/* Center both axes */}
<div className="align-center-h">      {/* Center horizontal */}
<div className="align-center-v">      {/* Center vertical */}
<div className="align-between">       {/* Space between */}
<div className="align-around">        {/* Space around */}

<div className="grid-auto-fit">       {/* Auto-fit grid */}
<div className="grid-flow">           {/* CSS grid flow */}
```

## 💬 Text Styles

```jsx
<span className="gradient-text">            {/* Gradient text */}
<span className="gradient-text-secondary">  {/* Alt gradient */}
<div className="section-title">             {/* Section header */}
<div className="shimmer-line">              {/* Shimmer effect */}
```

## ✨ Animations

```css
animate-float           /* Floating motion */
animate-glow-pulse      /* Pulsing glow */
animate-shimmer         /* Shimmer effect */
animate-slide-in-left   /* Slide from left */
animate-slide-in-right  /* Slide from right */
animate-slide-in-up     /* Slide from bottom */
animate-fade-in         /* Fade in */
animate-scale-in        /* Scale + fade */
```

## 🎯 Color Palette

```
Primary:   var(--brand)        /* Theme-dependent */
Success:   #34d399
Error:     #f87171
Warning:   #fbbf24
Info:      #60a5fa
Text:      #e2e8f0
Muted:     #94a3b8
Border:    rgba(255,255,255,0.08)
```

## 📦 Components to Import

```jsx
import {
  Card,
  Button,
  Badge,
  StatCard,
  SectionHeader,
  GradientText,
  Divider,
  InfoBox,
  Container,
} from "../components/DesignComponents";
```

## 🎨 Switch Theme

```javascript
import { useTheme } from "./utils/themes";

const { setTheme } = useTheme();
setTheme("ocean"); // ocean, forest, sunset, mint, neon, default
```

## 🖱️ View Showcase

Visit `/design-showcase` to see all components in action

## 📚 Full Guide

See `DESIGN_SYSTEM.md` for complete documentation

---

**Quick Tips:**

- Use `card-glass` for modern floating effects
- Combine textures with themes for unique looks
- Keep animations subtle - don't overuse
- Use status colors for semantic meaning
- Always pair action buttons with ghost buttons for secondary actions
