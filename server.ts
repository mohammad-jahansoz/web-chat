import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectToDatabase, getDB } from "./startup/db";
import session, { SessionOptions } from "express-session";
import MongoStore from "connect-mongo";
import Message from "./model/saveMessages";
import { ObjectId } from "mongodb";

declare module "express-session" {
  export interface SessionData {
    userId: string;
  }
}

declare module "express-serve-static-core" {
  export interface Request {
    userId: string;
  }
}

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);
const sessionOption: SessionOptions = {
  secret: "super fucking secret key",
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

dotenv.config();
app.use(session(sessionOption));
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    req.userId = req.session.userId;
  }
  next();
});
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "views");

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on(
    "chat message",
    (pm: string, userId: ObjectId, conversationId: ObjectId) => {
      console.log("Received message:", pm);
      socket.broadcast.emit("chat message", pm);
      if (!conversationId) {
        async () => {
          const message = new Message(
            pm,
            new ObjectId(userId),
            new Date(),
            null
          );
          await message.save();
        };
      } else {
        async () => {
          const message = new Message(
            pm,
            new ObjectId(userId),
            new Date(),
            new ObjectId(conversationId)
          );
          await message.save();
        };
      }
    }
  );
});

app.get("/chat", (req: Request, res: Response) => {
  res.render("client/chat", { userId: req.userId });
});
app.get("/auth/login", (req: Request, res: Response) => {
  res.render("client/login");
});
app.post("/auth/login", async (req: Request, res: Response) => {
  // const { username, password } = req.body;
  console.log(req.body.username, req.body.password);
  const user = await getDB()
    .collection("users")
    .findOne({ username: req.body.username, password: req.body.password });
  if (user) {
    req.session.userId = user._id.toString();
    res.redirect("/chat");
  }
});

server.listen(3000, () => {
  connectToDatabase();
  console.log("listening on port 3000");
});
