'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

const CHANNEL_ID = (process.env.CHANNEL_ID) ?
  process.env.CHANNEL_ID :
  config.get('channelId');

const CHANNEL_SECRET = (process.env.CHANNEL_SECRET) ?
  process.env.CHANNEL_SECRET :
  config.get('channelSecret');

const CHANNEL_TOKEN = (process.env.CHANNEL_TOKEN) ?
  process.env.CHANNEL_TOKEN :
  config.get('channelAccessToken');

if (!(CHANNEL_ID && CHANNEL_SECRET && CHANNEL_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

app.post('/webhook', function(req, res) {
  if (req.body && req.body.events && req.body && req.body.events.length > 0) {

    let replyToken = req.body.events[0]["replyToken"];
    let senderUserId = req.body.events[0]["source"].userId;

    replyApi(replyToken, welcomeTemplate())

  }

  res.sendStatus(200);

});

let welcomeTemplate = () => {
  return {
    type: "template",
    altText: "new message incoming..",
    template: {
      type: "buttons",
      actions: [
        {
          type: "message",
          label: "Ticket",
          text: "https://www.zipeventapp.com/e/BarCamp-Songkhla-5"
        },
        {
          type: "message",
          label: "Facebook",
          text: "https://www.facebook.com/BarcampSongkhla"
        },
        {
          type: "message",
          label: "Twitter",
          text: "https://twitter.com/barcampsongkhla"
        },
        {
          type: "uri",
          label: "Location",
          uri: "line://app/102"
        }
      ],
      thumbnailImageUrl: "https://zipimg.azureedge.net/images/events/6AD6645D-9E88-4A01-ADB4-A7D5EB6FA922/584B388F-2B37-4245-820C-B472B1F7EC04.jpg",
      title: "Barcamp Songkhla 5",
      text: "#barcampsk"
    }
  }
}

function verifyRequestSignature(req, res, buf) {
  let signature = req.headers["x-line-signature"];
}

function replyApi(replyToken, message) {

  let data = {
    replyToken: replyToken,
    messages: [message]
  }

  request({
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/reply',
    headers: {
      'Content-type': '	application/json',
      'Authorization': 'Bearer ' + CHANNEL_TOKEN
    },
    json: data
  },(error, response, body) => {

    if (error) console.error(error)

  })
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
