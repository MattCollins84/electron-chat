var SNSClient = require('sns-node-client')
var app = angular.module('chat', [])

app.factory('User', function() {
  return {
    name: '',
    socket_id: null
  }
})

app.factory('State', function() {
  return {
    showHomepage: true,
    showChatScreen: false,
    users: {},
    sns: null,
    messages: []
  }
})

app.filter('formatMessages', function() {
  return function(messages) {
    return messages.map(m => {
      m.date = new Date(m.ts).toTimeString().split(" ")[0]
      return m;
    }).reverse()
  };
})

app.controller('homepage', function($scope, User, State) {
  
  $scope.state = State;
  $scope.user = User;

  $scope.start = function() {
    
    // must have a name
    if ($scope.user.name === "") {
      return false;
    }

    // modify app state to hide the home screen
    // and show the chat screen
    $scope.state.showHomepage = false;
    $scope.state.showChatScreen = true;
    
    // connect to SNS
    $scope.state.sns = new SNSClient({
      sns_host: 'http://localhost:6011',
      authentication: {
        host: "localhost",
        key: "demokey"
      },
      userData: {
        name: $scope.user.name,
        user_type: "electron-chat"
      },
      userQuery: {
        user_type: "electron-chat"
      }
    });

  }

});

app.controller('chatScreen', function($scope, User, State) {
  
  $scope.state = State;
  $scope.user = User;
  $scope.msg = "";

  $scope.$watch(function () { return State.sns; }, function (newValue, oldValue) {
    
    if (newValue !== oldValue && typeof newValue === "object" && newValue !== null) {
      $scope.SNSSetup()
    }

  });

  // Send MSG
  $scope.sendMsg = function() {

    var data = {
      msg: $scope.msg,
      name: $scope.user.name,
      ts: new Date().getTime()
    }

    $scope.state.sns.send({ user_type: "electron-chat" }, data)
    $scope.msg = "";

  }

  // setup SNS listeners
  $scope.SNSSetup = function() {

    $scope.state.sns.on('connected', $scope.connected)
    $scope.state.sns.on('currentUsers', $scope.currentUsers)
    $scope.state.sns.on('connectedUser', $scope.connectedUser)
    $scope.state.sns.on('disconnectedUser', $scope.disconnectedUser)
    $scope.state.sns.on('notification', $scope.notification)

  }

  // handlers for the listeners
  $scope.connected = function() {
    $scope.user.socket_id = this.id
  }

  $scope.currentUsers = function(users) {
    
    $scope.$apply(function() {
      users.forEach(function(u) {
        $scope.state.users[u._socket_id] = u;
      });
    });

  }

  $scope.connectedUser = function(user) {

    $scope.$apply(function() {
      $scope.state.users[user._socket_id] = user;
    });

  }

  $scope.disconnectedUser = function(user) {

    $scope.$apply(function() {
      delete $scope.state.users[user._socket_id]
    });
  }

  $scope.notification = function(msg) {

    $scope.$apply(function() {
      $scope.state.messages.push(msg)
    });
  }

});