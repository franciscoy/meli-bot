var express = require('express');
var server = express();
var BinaryServer = require('binaryjs').BinaryServer;
var base64 = require('base64-stream');
var Stream = require('stream');
var fs = require("fs");
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
	console.log(req.body.entry[0].messaging[0]);
  //sendTextMessage(req.body.entry[0].messaging[0].recipient.id, 'hola mundo');
  res.sendStatus(200);
});

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
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
