## Overview

GlideRecord is powerful but expensive if misused.

---

## Best Practices

- Query only required fields
- Use indexes
- Avoid loops inside loops

## Scripts

```javascript
var gr = new GlideRecord("incident");
gr.addQuery("active", true);
gr.setLimit(10);
gr.query();
while (gr.next()) {
  gs.info(gr.number);
}