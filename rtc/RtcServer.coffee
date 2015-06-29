easyrtc = require 'easyrtc'

class RtcServer

    appName: 'audi-panel'
    defaultRoomName: 'audi-panel'
    appObj: null

    constructor: ->
        easyrtc.setOption 'demosEnable', no
        easyrtc.setOption 'roomAutoCreateEnable', yes
        easyrtc.setOption 'roomDefaultEnable', no
    
    listen: (httpApp, socketServer, options = null) ->

        socketServer.sockets.on "connection", (socket) ->
            # console.log socket
            # return
        
        easyrtc.listen httpApp, socketServer, options, @onStartUpComplete
    
    onStartUpComplete: (err, pub) =>
        pub.createApp @appName, null, @onAppCreated
        @connect = pub.events.defaultListeners.connection
        @disconnect = pub.events.defaultListeners.disconnect
        @roomLeave = pub.events.defaultListeners.roomLeave
        easyrtc.events.on 'connection', @onConnection
        easyrtc.events.on 'disconnect', @onDisconnect
        easyrtc.events.on 'roomLeave', @onRoomLeave

    onAppCreated: (err, appObj) => 
        @appObj = appObj 
    
    onConnection: (socket, easyrtcid, next) =>
        @connect socket, easyrtcid, next
        console.log "------>>>>> #{easyrtcid} has connected"
        # obj = JSON.stringify(@appObj, null, 4)
        # console.log "AppObj: #{obj}"

    onDisconnect: (connectionObj, next) =>
        @disconnect connectionObj, next
        console.log "------>>>>> #{connectionObj.getEasyrtcid()} has disconnected"

    onRoomLeave: (connectionObj, roomName, next) =>
        console.log "Leaving room #{roomName}"

        connectionObj.room roomName, (err, roomConnection) =>

            @roomLeave connectionObj, roomName, (err) =>
                next err
                
                room = roomConnection.getRoom()

                room.getConnectionCount (err, count) =>
                    console.log "Room #{roomName} has #{count} connection(s)"

                    # If there is no connection in this room
                    if count is 0
                        # Delete this room so room name becomes available
                        @appObj.deleteRoom roomName, (err, result) ->
                            console.log "Result of deleting a room: #{result}"



module.exports = new RtcServer