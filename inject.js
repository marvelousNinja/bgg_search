$(function() {
  $(document).bind('textselect', function(e) {
    chrome.runtime.sendMessage({'bgg': { 'searchTerm': e.text } });
  });
});