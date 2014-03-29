chrome.runtime.onMessage.addListener(function(request) {
  searchTerm = request.bgg.searchTerm;

  var opt = {
    type: "basic",
    title: "BGG Search",
    message: "Searching for: " + searchTerm + "...",
    iconUrl: "icon.png"
  }

  notificationId = '';
  chrome.notifications.create('', opt, function(id) { notificationId = id });

  $.get("http://www.boardgamegeek.com/xmlapi/search",
    { search: searchTerm },
    function(response) {
      nodeList = response.querySelectorAll('boardgame');

      ids = [];

      for(var i = nodeList.length; i--; ids.unshift(nodeList[i].getAttribute('objectid')));

      $.get("http://www.boardgamegeek.com/xmlapi/boardgame/" + ids.join(),
        { stats: 1 },
        function(response) {
          nodeList = response.querySelectorAll('boardgame');

          boardgames = [];

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
              message: boardgame.userRating
            }
          });
          
          opt.type = "list";
          opt.items = search_resuts;

          chrome.notifications.update(notificationId, opt, function() {});
        }
      );
    }
  );
 });