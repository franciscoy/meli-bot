var express = require('express');
var server = express();
var page_token = "EAAEbEbJAC78BAMznWNyMVS0GD7TKLYBhuCSK74QFphfnkZBoILKzZBKLh31wFM7W6lK7jdQbYmkIocbV2xYZCHMem6CvHWJRCmMVJDZAZBNbEm8PvZAsqDHamVlsVhaRaAOl3id6abpRh1dxStIFaMAXdhQXktPuV34jgESh5CJwZDZD";
var SERVER_PORT = 8080;
var bodyParser = require('body-parser');
var request = require('request');

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/hello',function(req,res){
  res.send(req.query['hub.challenge']);    
});

server.post('/hello',function(req,res){
	var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          sendTextMessage(event.sender.id, 'hola mundo');      
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    
    res.sendStatus(200);
  }

});

function sendTextMessage(senderId, messageText) {
  var messageData = {
    recipient: {
      id: senderId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: page_token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

server.listen(SERVER_PORT);
