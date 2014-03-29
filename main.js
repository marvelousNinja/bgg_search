chrome.runtime.onMessage.addListener(function(request) {
  searchTerm = request.bgg.searchTerm;
  $.get("http://www.boardgamegeek.com/xmlapi/search",
    { "search": searchTerm },
    function(response) {
      nodeList = response.querySelectorAll('boardgame');

      ids = [];

      for(var i = nodeList.length; i--; ids.unshift(nodeList[i].getAttribute('objectid')));

      $.get("http://www.boardgamegeek.com/xmlapi/boardgame/" + ids.join(),
        { "stats": 1 },
        function(response) {
          nodeList = response.querySelectorAll('boardgame');

          boardgames = [];

          for(var i = nodeList.length; i--; i <= 0) {
            node = nodeList[i];

            boardgames.unshift({
              "name": node.querySelector('name[primary]').innerHTML,
              "geekRating": node.querySelector('bayesaverage').innerHTML,
              "userRating": node.querySelector('average').innerHTML,
              "gameRank": node.querySelector('rank[type=subtype]').getAttribute('value')
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

          window.games = boardgames;

          // webkitNotifications.createNotification(
          //   'icon.png',  // icon url - can be relative
          //   'Games found:',  // notification title
          //   "some multi\n line text" // notification body text
          //   );//.show();

          var opt = {
            type: "progress",
            title: "Primary Title",
            message: "Primary message to display",
            iconUrl: "icon.png",
            items: [{ title: "Item1", message: "This is item 1."},
                    { title: "Item2", message: "This is item 2."},
                    { title: "Item3", message: "This is item 3."}]
          }

          chrome.notifications.create('', opt, function() {});
        }
      );
    }
  );
 });