import express, { Express } from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import { handleSocketConnection } from './sockets/socketHandler';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

handleSocketConnection(io);

const PORT: string | number = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 