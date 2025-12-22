# Future Feature Ideas Log

This document tracks potential future enhancements for the Synapse Spark Mental Math App.

---

### 3. Visual Hint Mode
**Description**: Display hints using visual breakdowns (like vertical multiplication steps) rather than just text.
**Inspiration**: User feedback on "breaking down challenges".

---

## Medium Priority

### 4. Weekly Progress Reports
**Description**: Email or in-app notification summarizing the week's progress  
**Content**:
- Total XP gained
- Accuracy trend
- Streak status
- Top improved skill
- Personalized encouragement message

**Tech**: Use local notifications or email API

---

### 5. Word Problem Challenge Mode
**Description**: A dedicated mode for solving real-world scenarios.
**Current State**: Word problems are only in Lessons.
**Enhancement**: Create a "Real World" game mode that exclusively serves word problems.

---

## Low Priority / Nice to Have

### 7. Data Export & Backup
**Description**: Allow users to download their progress as JSON  
**Use Case**: Backup before clearing browser data, transfer between devices

---

### 8. Theming & Customization
**Description**: Light/dark mode toggle, custom accent colors  
**Current State**: Dark mode only  
**Enhancement**: Add preferences panel

---

### 9. Offline Mode
**Description**: Use service workers to enable offline play  
**Challenge**: Currently relies on localStorage (already works offline for state)  
**Enhancement**: Add PWA manifest for "install to home screen"

---

## Ideas from Development

### During Lesson Mode Implementation
- **Suggested Lessons**: After a failed problem, suggest a relevant lesson (e.g., fail a 65² → suggest "Squaring Strike")
- **Lesson Completion Badges**: Mark protocols as "Mastered" after scoring 100% on drill

### During Persistence Implementation
- **Daily Briefing**: On app open, show a "Daily Challenge" (e.g., "Solve 20 percentage problems today")
- **Streak Recovery**: Allow 1 "freeze" per week to preserve streak if you miss a day (gamification tactic)

---

## Implementation Notes
When implementing any of these:
1. Update `task.md` with the new phase
2. Create an `implementation_plan.md`
3. Write unit tests
4. Document in `walkthrough.md`
