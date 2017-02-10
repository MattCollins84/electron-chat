const SNSClient = require('sns-node-client');
const sns = new SNSClient({
  sns_host: 'http://localhost:6011',
  authentication: {
    host: "localhost",
    key: "demokey"
  },
  userData: {
    name: "Matt",
    user_type: "electron-chat"
  },
  userQuery: {
    user_type: "electron-chat"
  }
});