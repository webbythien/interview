# Lido Websocket

## Introduction
- This document provides an overview of the Node.js code responsible for setting up a Socket.io server. The code initializes an Express.js HTTP server, configures a Socket.io instance, and establishes WebSocket communication for real-time interactions.

- Using Redis pub/sub for socket connection and room subscription.

## Code Overview
The code is divided into functions that handle specific tasks, such as setting up the Express.js server, configuring Socket.io, and starting the server listener.

## Usage
To use this code for setting up this Socket.io server:

1. Ensure all required dependencies are installed 
```
npm install
```
2. Config .env file -> For sure Redis is connect.
3. Execute to start the Socket.io server
```
node index.js
```

## Room subscription
This document outlines the connect function, which is responsible for managing socket connections and room subscriptions within the Socket.io server. The function uses asynchronous techniques and promises to handle joining and leaving rooms, as well as subscribing and unsubscribing from rooms.

## Usage
When you **already** run Socket.io server.

You connect to this server by Postman ( mode: Socket.io)

Each time user connect to this server ( by port) -> Connect to socket -> Socket connect subscribe or unsubscribe by redis

Test with Postman ( mode: Socket.io):
- Connect -> subscribe -> Wait to join room -> Socket join room
- Disconnect -> unsubscribe -> Wait to leave room -> Socket leave room
