http = require 'http'
io = require 'socket.io'
express = require 'express'
rtcServer = require './rtc/RtcServer'

class Server
    args = process.argv.splice(2)

    # port = 80
    port = 5000

    constructor: ->
        @setUp()

    setUp: ->
        try
            httpApp = express()

            httpApp.set 'port', (args[0] or port)

            # httpApp.use express.static "#{__dirname}/../", maxAge: 30000000
            httpApp.use express.static "#{__dirname}/client/app/public/"

            webServer = http
                .createServer(httpApp)
                .listen (args[0] or port)

            socketServer = io.listen webServer, {'log level': 1}
            rtcServer.listen httpApp, socketServer 
        catch err
            console.error err.message, err.stack
        return

new Server