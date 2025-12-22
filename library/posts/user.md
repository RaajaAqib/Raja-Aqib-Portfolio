# ServiceNow Flow Designer

This is a test document.

## Example

```javascript

function getUserData(userId) {
    var gr = new GlideRecord('sys_user');
    if (gr.get(userId)) {
        return gr.name.toString();
    }
    return null;
}
```
## Second Example
```javascript

function getUserData(userId) {
    var gr = new GlideRecord('sys_user');
    if (gr.get(userId)) {
        return gr.name.toString();
    }
    return null;
}
