chrome.runtime.onMessage.addListener(function(request) {
  searchTerm = request.bgg.searchTerm;
  $.get("http://www.boardgamegeek.com/xmlapi/search",
    { "search": searchTerm },
    function(response) {
      nodeList = response.querySelectorAll('boardgame')

      ids = [];

      for(var i = Math.min(nodeList.length, 5); i--; ids.unshift(nodeList[i].getAttribute('objectid')));

      console.log(ids);
    }
  );

  // if (request.bgg != undefined)
  //   var search = request.bgg.search

  //   webkitNotifications.createNotification(
  //    'icon.png',  // icon url - can be relative
  //    search,  // notification title
  //    'Searching...'  // notification body text
  //  ).show();
 });