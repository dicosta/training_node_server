const WSServer = require('ws').Server;
const server = require('http').createServer();
const app = require('./http-server');
const listingModel = require('./models/listingModel');

const ACTION_SUSCRIBE = 'SUSCRIBE'
const ACTION_UNSUSCRIBE = 'UNSUSCRIBE'

// Store a collection of suscribers to listings
// It is a map that uses the listing Id as a key, and points to a List of connected clients
var channels = new Map();

// Create web socket server on top of a regular http server
let wss = new WSServer({
    server: server
});

// function to add a unique identifier to a connected client
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

// mount the express app
server.on('request', app);

//suscribe to event bus that notifies the changes on a listing 
listingModel.eventBus.on('listing-changed', function(listing) {
    const listing_id = listing.id.toString()

    console.log(`Listing ${listing_id} changed. Emmiting to Clients of this listing/channel`)

    //get the clients suscribed to this listing
    var clients = channels.get(listing_id)

    //send the updated listing to the suscribed clients
    if (clients != null && clients.length > 0) {
        clients.forEach(function each(client) {
            client.send(JSON.stringify(listing));
        });        
    } else {
        console.log(`No Clients found for Listing ${listing_id}`)
    }    
});

wss.on('connection', function connection(connection, req) {
    //assign unique identifier to client
    connection.id = wss.getUniqueID()
    
    console.log(`new WS Client connection established from: ${req.socket.remoteAddress}`);

    connection.on('message', function incoming(message) {    
        console.log(`received: ${message}`);
        
        var json = JSON.parse(message)
        if (ACTION_SUSCRIBE === json.action) {
            subscribe(json.listing_id, connection)
        } else if (ACTION_UNSUSCRIBE === json.action) {
            unsubscribe(json.listing_id, connection)
        } else {
            connection.send(JSON.stringify({"message" : "unkonown action"}))
        }
    })

    connection.on('close', function(code, reason) {
        //when the client closes the connection, unsuscribe it from all channels/listings
        unsubscribeFromAllChannels(connection)
        console.log(`WS Client connection closed [${reason}]`)
    })
});

function subscribe(listingId, client) {    
    const clients = channels.get(listingId)

    if (clients != null) {
        clients.push(client)
    } else {
        var newClientsList = []
        newClientsList.push(client)
        channels.set(listingId, newClientsList)
    }
}

function unsubscribe(listingId, client) {    
    if (channels.has(listingId)) {
        
        channels.set(listingId, channels.get(listingId).filter(suscribedClient => {
            return suscribedClient.id !== client.id;
        }));
    }
}

function unsubscribeFromAllChannels(client) {
    for (let listingId of channels.keys()) {
        unsubscribe(listingId, client)
    }    
}

server.listen(process.env.PORT || 3000, function() {
  console.log(`HTTP/WS server listening on ${process.env.PORT || 3000}`);
});