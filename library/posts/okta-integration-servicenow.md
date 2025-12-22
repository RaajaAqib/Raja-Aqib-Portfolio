## Overview

Okta integration enables SSO, MFA, and identity verification.

---

## Use Cases

- User authentication
- Identity sync

## Scripts

```javascript
var rm = new sn_ws.RESTMessageV2("Okta Integration", "Get User");
var response = rm.execute();