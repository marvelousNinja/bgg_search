chrome.runtime.onMessage.addListener(function(request) {
  if (request.bgg_search != undefined)
    webkitNotifications.createNotification(
     '48.png',  // icon url - can be relative
     request.bgg_search,  // notification title
     'Searching...'  // notification body text
   ).show();
 });