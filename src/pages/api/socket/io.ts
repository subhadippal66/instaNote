// 8:38 timestamp

import { NextApiResponseServerIo } from "@/lib/types"
import { Server as NetServer } from "https"
import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"

export const config = {
    api: {
        bodyParser: false,
    }
}

const ioHandler = (req:NextApiRequest, res:NextApiResponseServerIo)=>{
    if(!res.socket.server.io){
        const path = '/api/socket/io'

        const httpServer: NetServer = res.socket.server as any;

        const io = new ServerIO(httpServer,{
            path,
            addTrailingSlash: false
        });

        io.on('connection', (s)=>{
            s.on('create-room', (fileId)=>{
                s.join(fileId)
            })
            s.on('send-changes', (delta, fileId)=>{
                s.to(fileId).emit('receive-changes', delta, fileId)
            })
            s.on('send-cursor-move', (range, fileId, cursorId)=>{
                s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId)
            })
        })
        res.socket.server.io = io;
    }
    res.end();
}

export default ioHandler