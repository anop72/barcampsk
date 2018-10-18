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

const eventType = {
  message: 'message',
  postback: 'postback'
}

app.post('/webhook', function(req, res) {
  if (req.body && req.body.events && req.body && req.body.events.length > 0) {

    let event = req.body.events[0]

    let replyToken = req.body.events[0]["replyToken"];
    let senderUserId = req.body.events[0]["source"].userId;

    //addLiffApp()

    (eventType.message === event.type) ? replyApi(replyToken, welcomeTemplate()) : replyApi(replyToken, topicMessages())

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
          type: "postback",
          label: "Invited Topic",
          data: "selected-topic"
        },
        {
          type: "message",
          label: "Facebook",
          text: "https://www.facebook.com/BarcampSongkhla"
        },
        {
          type: "uri",
          label: "Location",
          uri: "line://app/1615319033-WyRmpxzR"
        }
      ],
      thumbnailImageUrl: "https://zipimg.azureedge.net/images/events/6AD6645D-9E88-4A01-ADB4-A7D5EB6FA922/584B388F-2B37-4245-820C-B472B1F7EC04.jpg",
      title: "Barcamp Songkhla 5",
      text: "#barcampsk"
    }
  }
}

let topicMessages = () => {
  return {
    "type": "template",
    "altText": "this is a carousel template",
    "template": {
      "type": "carousel",
      "actions": [],
      "columns": [
        {
          "thumbnailImageUrl": "https://www.trendy2.mobi/wp-content/uploads/ais-logo.jpg",
          "title": "Digital Disruption & Transformation",
          "text": "AIS",
          "actions": [
            {
              "type": "message",
              "label": "Vote",
              "text": "Voted"
            }
          ]
        },
        {
          "thumbnailImageUrl": "https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2016/02/04/ac426b52d74b473bb3e93967749f8f82.jpg",
          "title": "Building a Wongnai Search",
          "text": "Wongnai",
          "actions": [
            {
              "type": "message",
              "label": "Vote",
              "text": "Voted"
            }
          ]
        },
        {
          "thumbnailImageUrl": "https://is5-ssl.mzstatic.com/image/thumb/Purple115/v4/00/ee/17/00ee1790-6ca7-dc0d-5e7c-816a222b2221/source/512x512bb.jpg",
          "title": "Introduction to LINE Messaging API",
          "text": "Fungjai",
          "actions": [
            {
              "type": "message",
              "label": "Vote",
              "text": "Voted"
            }
          ]
        }
      ]
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

function pushApi(id, message) {

  let data = {
    to: id,
    messages: [message]
  }

  request({
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/push',
    headers: {
      'Content-type': '	application/json',
      'Authorization': 'Bearer ' + CHANNEL_TOKEN
    },
    json: data
  },(error, response, body) => {

    if (error) console.error(error)

  })
}

let addLiffApp = () => { // Location app

  let data = {
    view: {
      type: "compact",
      url: "https://goo.gl/maps/5sfkfM4piux"
    }
  }

  request({
    method: 'POST',
    uri: 'https://api.line.me/liff/v1/apps',
    headers: {
      'Content-type': '	application/json',
      'Authorization': 'Bearer ' + CHANNEL_TOKEN
    },
    json: data
  },(error, response, body) => {

    if (error) console.error(error)

    console.log(body);

  })

}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
