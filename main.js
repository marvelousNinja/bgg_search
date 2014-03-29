chrome.runtime.onMessage.addListener(function(request) {
  searchTerm = request.bgg.searchTerm;

  var notificationId = undefined;
  notifyProgress = function(progress, data) {
    var opt = {
      type: "progress",
      title: "BGG Search",
      message: "Searching for: " + searchTerm + "...",
      iconUrl: "chess.png",
      progress: progress
    }
    if (progress == 100) {
      opt.type = "list";
      opt.items = data;
      delete opt['progress'];
      chrome.notifications.clear(notificationId, function() {
        chrome.notifications.create('', opt, function() {});
      });
    }
    if (notificationId == undefined) {
      chrome.notifications.create('', opt, function(id) { notificationId = id })
    } else {
      chrome.notifications.update('', opt, function() {});
    }    
  }

  notifyProgress(10);

  $.get("http://www.boardgamegeek.com/xmlapi/search",
    { search: searchTerm },
    function(response) {

      notifyProgress(20);

      nodeList = response.querySelectorAll('boardgame');

      ids = [];

      for(var i = nodeList.length; i--; ids.unshift(nodeList[i].getAttribute('objectid')));

      notifyProgress(30);

      $.get("http://www.boardgamegeek.com/xmlapi/boardgame/" + ids.join(),
        { stats: 1 },
        function(response) {
          nodeList = response.querySelectorAll('boardgame');

          boardgames = [];

          notifyProgress(90);

          for(var i = nodeList.length; i--; i <= 0) {
            node = nodeList[i];

            boardgames.unshift({
              id: node.getAttribute('objectid'),
              name: node.querySelector('name[primary]').innerHTML,
              geekRating: node.querySelector('bayesaverage').innerHTML,
              userRating: node.querySelector('average').innerHTML,
              gameRank: node.querySelector('rank[type=subtype]').getAttribute('value')
            });
          }

          intCompare = function(a, b) {
            return a - b;
          }

          compare = function(a, b) {
            aRank = parseInt(a.gameRank);
            bRank = parseInt(b.gameRank);

            if (isNaN(aRank) && (isNaN(bRank))){
              return intCompare(parseInt(b.userRating), parseInt(a.userRating));
            }

            if (isNaN(aRank)) {
              return 1;
            }

            if (isNaN(bRank)) {
              return -1;
            }

            return intCompare(aRank, bRank);
          }

          boardgames = boardgames.sort(compare).slice(0, 5);

          search_resuts = boardgames.map(function(boardgame) {
            return {
              title: boardgame.name,
              message: Number(boardgame.userRating).toFixed(2)
            }
          });

          notifyProgress(100, search_resuts);
        }
      );
    }
  );
 });