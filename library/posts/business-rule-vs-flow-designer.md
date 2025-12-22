

## Overview

Both tools automate logic but serve different purposes.

---

## When to Use Business Rules

- Data enforcement
- Performance-critical logic

---

## When to Use Flow Designer

- Approvals
- Notifications
- Cross-table orchestration

:::warning
Avoid Business Rules for approvals.
:::

## Scripts

```javascript
(function executeRule(current) {
  if (current.priority == 1) {
    gs.info("High priority record");
  }
})();
