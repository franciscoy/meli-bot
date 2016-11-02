var express = require('express');
var server = express();
var page_token = "";
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
  var entry = req.body.entry[0].messaging[0];
  var textMessage = entry.message.text;
  if(textMessage=="imagen"){
    sendImage(entry.sender.id);
  }else if(textMessage=="video"){
    sendVideo(entry.sender.id);
  }else{
    sendGenericMessage(req.body.entry[0].messaging[0].sender.id);  
  }
  
  res.sendStatus(200);
});


function sendVideo(recipientId){
  var imageData = {
    recipient:{
      id: recipientId
    },
    message:{
      attachment:{
        type:"video",
        payload:{
          url:"http://techslides.com/demos/sample-videos/small.mp4"
        }
      }
    }
  }
  callSendAPI(imageData);
}

function sendImage(recipientId){
  var imageData = {
    recipient:{
      id: recipientId
    },
    message:{
      attachment:{
        type:"image",
        payload:{
          url:"http://www.pngmart.com/files/2/Drone-PNG-Pic.png"
        }
      }
    }
  }
  callSendAPI(imageData);
}

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

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

server.listen(SERVER_PORT);
