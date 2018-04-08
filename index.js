//
// This implements most of the bot code. It starts off by looking for the `bot_token` value that will
// have been stored if you successfully OAuthed with your Bot using the 'Add to Slack' button. Assuming
// it exists, it implements an instance of `slack`, and then listens out for incoming HTTP requests.
// It also implements code that watches for slash commands, sets up event handling for when events
// like `pin_added`, `star_added` or `reaction_added` are received. As well as using the database
// to record when actions like adding a star have been completed.
//



"use strict";

const ts = require('./tinyspeck.js'),
onboarding = require('./onboarding.json'),
users = {},
datastore = require("./datastore.js").data;
const axios = require('axios')
const cheerio = require('cheerio')

var connected = false;

function getWhoisNow() {
  return axios.get('http://at.hs3.pl/api/now')
  .then(res => {
    console.log(res.data)
    return res.data
  })
}

function getWhoisMessage(user, channel, token) {
  return getWhoisNow().then(function(now) {
    return Object.assign({ channel: channel, as_user: true }, {
      "text": `<@${user}> Hakują ${now.headcount} formy życia. Znane jako: ${now.users}. Jest ${now.unknown_devices} nieznanych urządzeń w spejsie.`,
      "attachments": []
    })
  })
}



// watch for onboarding slash commands




getConnected() // Check we have a database connection
.then(function() {
  var slack;

  slack = ts.instance({});

  slack.on('/ktohakuje', payload => {
            datastore.get(payload.token) // Grab the team's token
            .then(function(value) {
              console.log(value)
              let fiskusBot = slack.instance({ token: value })

              let user_id = payload.user_id;
              let channel_id = payload.channel_id;
              let token = payload.token;
              getWhoisMessage(user_id, channel_id, value)
              .then(msg => {
                            fiskusBot.send(payload.response_url, msg).then(res => { // on success
                              console.log("Response sent to slash command " + res.data.ok + " " + res.data.error);
                            }, reason => { // on failure
                              console.log("An error occurred when responding to slash command: " + reason);
                            })
                          })
            })
          })

  slack.listen('3000');
})



function getConnected() {
  return new Promise(function(resolving) {
    if (!connected) {
      connected = datastore.connect().then(function() {
        resolving();
      });
    } else {
      resolving();
    }
  });
}

function isJSON(data) {
  var ret = true;
  try {
    JSON.parse(data);
  } catch (e) {
    ret = false;
  }
  return ret;
}