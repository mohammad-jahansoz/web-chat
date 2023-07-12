import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import { connectToDatabase } from "./startup/db";
import session, { SessionOptions } from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import userRoutes from "./router/user";
import authRoutes from "./router/auth";
import socketController from "./controller/socket";

declare module "express-session" {
  export interface SessionData {
    userId: string;
  }
}

const sessionOption: SessionOptions = {
  secret: process.env.SESSION_SECRET_KEY || "PLS SET SECRET KEY",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/web-chat",
    ttl: 1000 * 60 * 60 * 24 * 90,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 90,
  },
};

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionOption));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "views");

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    req.userId = req.session.userId;
  }
  next();
});

app.use(userRoutes);
app.use(authRoutes);
socketController(io);

server.listen(3000, () => {
  console.log("listening on port 3000");
  connectToDatabase();
});
