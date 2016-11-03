var express = require('express');
var server = express();
var page_token = "";
var SERVER_PORT = 8080;
var bodyParser = require('body-parser');
var request = require('request');
const {Wit,log} = require('node-wit');
const client = new Wit({accessToken: ''});

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
          client.message(event.message.text, {})
          .then((data) => {
            console.log(data.entities.query[0].value);
            sendTextMessage(event.sender.id, 'Buscando ' + data.entities.query[0].value);
            callMeliSearchApi(event.sender.id, data.entities.query[0].value);
          })
          .catch(console.error);
          //sendTextMessage(event.sender.id, 'hola mundo');      
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

function callMeliSearchApi(senderId, query) {
  console.log('https://api.mercadolibre.com/sites/MLA/search?q='+query);

 request({
   uri: 'https://api.mercadolibre.com/sites/MLA/search?q=',
   qs: { q: query },
   method: 'GET'
 }, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     var recipientId = body.recipient_id;
     var messageId = body.message_id;

     var bodyJSON = JSON.parse(body);
     var itemArray = extractItems(bodyJSON.results);

     sendGenericMessage(senderId, itemArray);
   } else {
     console.error("Unable to call meli api.");
     console.error(response);
     console.error(error);
   }
 });  
}

function sendGenericMessage(recipientId,items) {
 var messageData = {
   recipient: {
     id: recipientId
   },
   message: {
     attachment: {
       type: "template",
       payload: {
         template_type: "generic",
         elements: items
       }
     }
   }
 }
 callSendAPI(messageData);
}

function extractItems(dataArray) {
 var items = [];
 for (var i = 0; i < Math.min(5, dataArray.length); i++) {
   var item = {};
   item.title = dataArray[i].title;
   item.subtitle = "ARS " + dataArray[i].price;
   item.item_url = null;
   item.image_url = dataArray[i].thumbnail;
   item.buttons = [{
             type: "web_url",
             url: dataArray[i].permalink,
             title: "Abrir item"
           }];

   items.push(item);
 }
 return items;
}

server.listen(SERVER_PORT);
