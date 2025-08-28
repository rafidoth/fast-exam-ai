import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runRouter } from "./routes.js";
import { Server } from "socket.io";
import { runSocket } from "./services/examSocket.js";
import { authCheck} from "./midlewares.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authCheck)

// Basic route
runRouter(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

runSocket(io);
