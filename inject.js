$(function() {
  $(document).bind('textselect', function(e) {
    chrome.runtime.sendMessage({'bgg_search': e.text});
  });
});