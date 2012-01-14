**mousefu** makes it easy to handle various mouse events and mouse coordinates

TODO: update readme with usage instructions

For example:
  
```javascript
// click & drag on #hello with the middle mouse button
$('#hello').mousefu('downmiddle move', function(c) {
  console.log('Drag start position:'+c.downmiddle.x+','+c.downmiddle.y);
  console.log('Current position:'+c.move.x+','+c.move.y);
});
```

Another example:

```javascript
// moving the mouse over #hello when the left mouse button is not clicked down
$('#hello').mousefu('!downleft move', function(c) {
  console.log('Position: '+c.move.x+','+c.move.y);
});
```