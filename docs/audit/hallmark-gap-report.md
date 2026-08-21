# TaMaD Hallmark Experience OS - Internal Gap Report
**Date:** 2026-08-21
**Branch:** feature/tamad-hallmark-experience-os

## Executive Summary
The current TaMaD platform is functionally mature but aesthetically and experientially lacks the "Hallmark OS" quality expected of premium tools like Linear, Notion, or Arc. The UX currently feels somewhat generic (Tailwind default aesthetics, basic spacing, minimal motion, and disjointed micro-interactions). This report identifies the gaps between the current state and the target premium experience.

## 1. Visual & Design Language Gaps (Phase 2 & 3)
### Basic UI & Generic Aesthetics
- **Typography**: Uses standard browser fonts (sans-serif) without a curated scale or editorial focus. Letter spacing and line heights are functional but not refined.
- **Colors**: The palette relies heavily on standard Tailwind colors (e.g., standard blue, gray). There is a lack of a purposeful, refined neutral palette with meaningful accent colors.
- **Surfaces**: Elements lack "layered depth" and sophisticated shadow usage. Dark mode is functional but feels overly contrasted in some areas rather than a calm, seamless dark environment.
- **Avoidances needed**: Current UI has remnants of generic SaaS looks, purple accents, or floating elements that need to be grounded.

## 2. Navigation & Layout Gaps (Phase 3 & 10)
### Repetitive Layouts & Poor Navigation
- **Sidebar & TopBar**: The sidebar is basic, lacking a refined hierarchy, contextual actions, and workspace switcher prominence. The TopBar does not effectively communicate "Where am I?" and "What should I do next?"
- **Command Palette**: Exists but lacks deep "keyboard-first" workflows (e.g., creating any item, running automation, switching teams without touching the mouse).
- **Search**: Current search is basic. It lacks fuzzy matching across all entities (Tasks, Projects, Notes, Members, Meetings), recent searches, and instant actions.

## 3. Workflow & Productivity Gaps (Phase 4, 5, 9)
### Missing Workflows & Productivity Shortcuts
- **Personal Mode**: Lacks a unified "Today's Priorities", Smart Suggestions, Global Quick Capture, Universal Inbox, and time insights. Focus mode and planner feel isolated rather than part of a unified OS.
- **Team Mode**: Missing enterprise-grade features such as Team Health, workload balancing, blocked work indicators, and sprint health visualization.
- **New Features Needed**: Need to introduce Task/Project Templates, Smart Reminders, Team Announcements, Meeting Agenda Builders, and robust AI summaries.

## 4. Domain-Specific Experience Gaps (Phase 6, 7, 8)
### Task & Project Experiences
- **Task Detail (Issue Detail)**: The current task modal/page is functional but far from Linear's quality. Missing robust inline editing, bulk actions, and rich optimistic updates. Context menus (right-click) are largely absent.
- **Projects & Agile**: Lacks visual polish for Kanban/Scrum boards. Needs capacity planning, dependency mapping, and smart sprint recommendations. Current boards are basic DnD lists without premium micro-interactions.

## 5. Interaction & Quality of Life Gaps (Phase 12 & 17)
### Missing Delight Moments & Contextual Actions
- **Micro-interactions**: Hover states are generic CSS `:hover`. Missing meaningful motion for task completion, sidebar transitions, toast animations, and drag feedback.
- **Quality of Life**: Missing right-click context menus across the app, drag-to-select, multi-select, quick rename inline, duplicate actions, and unsaved changes warnings.
- **Empty & Loading States**: Skeletons are generic. Empty states do not guide the user beautifully to the next action.

## 6. Technical & Delivery Gaps (Phase 13, 14, 15, 16)
### Weak Mobile UX & Accessibility
- **Responsive**: Desktop design is currently just "shrunk" for mobile. Needs dedicated mobile workflows, bottom sheets, and touch-optimized targets.
- **Accessibility**: ARIA labels, focus states, and semantic HTML are inconsistent. Keyboard navigation outside the command palette is limited.
- **Performance**: While Vite is fast, rendering large boards or complex task lists can cause layout thrashing. Animations need hardware acceleration (`transform`, `opacity`).
- **Security**: Current production hardening is good but must be rigorously maintained when overhauling components (e.g., keeping RBAC checks and JWT validation intact during UI rewrites).

---
**Conclusion**: To achieve the Hallmark OS transformation, we must systematically overhaul the design system (CSS variables, typography), rebuild the structural app shell, and iteratively refine each module (Tasks, Projects, Teams) with keyboard-first, highly polished interactions.