import express, { Express } from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import { handleSocketConnection } from './sockets/socketHandler';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pollRoutes from './routes/pollRoutes';

dotenv.config();

connectDB();

const app: Express = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use('/api/polls', pollRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

handleSocketConnection(io);

const PORT: string | number = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 