# jquery.dropdown - jQuery Plugin

### Basic usage:
Include the JS and CSS in your pages and call `dropdown` jQuery method to format your `select` inputs.
```javascript
$('select').dropdown();
```
> Note: Every `select` input must have an associated `id` attribute (otherwise you'll need the RandomUniqueID jQuery plugin)

### Using options
```javascript
$('select').dropdown({
  enableSearch: true, // will scroll to and highlight the row matching the key sequence you type (enabled by default)
  keyNav: true        // navigate through list items using the keyboard arrows (enabled by default)
});
```

Feel free to try it!
