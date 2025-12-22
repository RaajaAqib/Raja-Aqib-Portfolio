## Overview

REST APIs allow ServiceNow to exchange data with external systems.

---

## Integration Types

- Inbound REST
- Outbound REST

## Scripts

```javascript
var rm = new sn_ws.RESTMessageV2("My REST", "GET");
var response = rm.execute();
gs.info(response.getBody());