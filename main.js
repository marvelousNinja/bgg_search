chrome.runtime.onMessage.addListener(function(request) {
  var getParameters = function(request) {
    if (('bgg' in request) && ('searchTerm' in request.bgg)) {
      var searchTerm = request.bgg.searchTerm;
      searchTerm = searchTerm.substring(0, 20);
      searchTerm = searchTerm.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
      if (!(searchTerm.length < 2)) {
        return searchTerm;
      }
    }
  }

  var notifyAboutProgress = function(progress, params, notificationId, callback) {
    params.type = 'progress';
    params.progress = progress;
    if (notificationId == undefined) {
      chrome.notifications.create('', params, callback);
    } else {
      chrome.notifications.update(notificationId, params, function() {});
    }
  }

  var notifyAboutCompletion = function(data, params, notificationId, callback) {
    params.type = 'list';
    params.items = data;
    chrome.notifications.clear(notificationId, function() {
      chrome.notifications.create('', params, callback);
    });
  }

  var notify = function(progress, searchTerm, notificationId, data, callback) {
    var params = {
      title: 'BGG Search',
      message: 'Searching for: ' + searchTerm,
      iconUrl: 'chess.png'
    }

    callback = callback || function() {};

    if (progress < 100) { 
      notifyAboutProgress(progress, params, notificationId, callback); 
    } else {
      notifyAboutCompletion(data, params, notificationId, callback);
    }
  }

  var getGameIds = function(searchTerm, callback) {
    var searchEndpoint = 'http://www.boardgamegeek.com/xmlapi/search';
    var params = { search: searchTerm };
    
    $.get(searchEndpoint, params, function(response) {
      var nodeList = response.querySelectorAll('boardgame');
      var gameIds = [];
      for(var i = nodeList.length; i--; gameIds.unshift(nodeList[i].getAttribute('objectid')));
      callback(gameIds);        
    });
  }

  var getGameStats = function(gameIds, callback) {
    var statsEndpoint = "http://www.boardgamegeek.com/xmlapi/boardgame/";
    statsEndpoint = statsEndpoint + gameIds.join();
    var params = { stats: 1 };

    $.get(statsEndpoint, params, function(response) {
      var nodeList = response.querySelectorAll('boardgame');
      var gameStats = [];

      for(var i = nodeList.length; i--; i <= 0) {
        node = nodeList[i];

        gameStats.unshift({
          id: node.getAttribute('objectid'),
          name: node.querySelector('name[primary]').innerHTML,
          geekRating: node.querySelector('bayesaverage').innerHTML,
          userRating: node.querySelector('average').innerHTML,
          gameRank: node.querySelector('rank[type=subtype]').getAttribute('value'),
          yearPublished: node.querySelector('yearpublished').innerHTML
        });
      }
      callback(gameStats);
    });
  }

  var sortGameStats = function(gameStats) {
    var intCompare = function(a, b) {
      return a - b;
    }

    var compare = function(a, b) {
      var aRank = parseInt(a.gameRank);
      var bRank = parseInt(b.gameRank);
      
      // If both games have a BGG rank, compare them
      if (!(isNaN(aRank) || isNaN(bRank))) {
        return intCompare(aRank, bRank);
      } else {
        // If both games have no BGG rank, compare them by user rating
        if (isNaN(aRank) && isNaN(bRank)) {
          var aUserRating = parseInt(a.userRating);
          var bUserRating = parseInt(b.userRating);
          return intCompare(bUserRating, aUserRating);
        } else {
          if (isNaN(aRank)) {
            return 1;
          } else {
            return -1;
          }
        }
      }
    }

    return gameStats.sort(compare).slice(0, 5);
  }

  var simplifyGameStats = function(gameStats) {
    return gameStats.map(function(game) {
      var name = game.name;
      name = (name.length > 15) ? (game.name.substring(0, 15) + '...') : (name);
      var yearPublished = ' (' + game.yearPublished + ')';
      var rating = Number(game.geekRating).toFixed(2);
      return {
        title: name + yearPublished,
        message: rating
      };
    });
  }

  var searchForTheGames = function(searchTerm) {
    if(searchTerm) {
      var notificationId,
          gameIds,
          gameStats;

      notify(30, searchTerm, undefined, undefined, function(id) { notificationId = id });
      getGameIds(searchTerm, function(gameIds) {
        notify(60, searchTerm, notificationId);
        gameStats = getGameStats(gameIds, function(gameStats) {
          notify(90, searchTerm, notificationId);
          gameStats = sortGameStats(gameStats);
          gameStats = simplifyGameStats(gameStats);
          notify(100, searchTerm, notificationId, gameStats);  
        });
      });
    }
  }

  var searchTerm = getParameters(request);
  searchForTheGames(searchTerm);
});