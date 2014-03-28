$(function() {
  $(document).bind('textselect', function(e) {
    alert(e.text);
  });
});