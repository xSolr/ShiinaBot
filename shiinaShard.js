//All credit goes to Abal, just testing this out for now <3
const Bucket = require("../util/Bucket");
const Call = require("../structures/Call");
const Constants = require("../Constants");
const ExtendedUser = require("../structures/ExtendedUser");
const OPCodes = Constants.GatewayOPCodes;
const User = require("../structures/User");
var WebSocket = typeof window !== "undefined" ? window.WebSocket : require("ws");
const Zlib = require("zlib");

var EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch(err) {
    EventEmitter = require("events").EventEmitter;
}
var Erlpack;
try {
    Erlpack = require("erlpack");
} catch(err) { // eslint-disable no-empty
}
try {
    WebSocket = require("uws");
} catch(err) { // eslint-disable no-empty
}


class Shard extends EventEmitter {
    constructor(id, client) {
        super();

        this.id = id;
        this.client = client;

        this.hardReset();
    }

    get latency() {
        return this.lastHeartbeatSent && this.lastHeartbeatReceived ? this.lastHeartbeatReceived - this.lastHeartbeatSent : Infinity;
    }

    /**
    * Tells the shard to connect
    */
    connect() {
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.client.emit("error", new Error("Existing connection detected"), this.id);
            return;
        }
        ++this.connectAttempts;
        this.connecting = true;
        return this.initializeWS();
    }
