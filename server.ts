import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectToDatabase, getDB } from "./startup/db";
import session, { SessionOptions } from "express-session";
import MongoStore from "connect-mongo";
import Message from "./model/saveMessages";
import { ObjectId } from "mongodb";
import bodyParser from "body-parser";
import NewMessage from "./model/Message";
import mongodb from "mongodb";
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
app.use(bodyParser.urlencoded({ extended: false }));
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

let users: { [userId: string]: string } = {};

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("register", (userId: string) => {
    socket.join(userId);
    // console.log("register" + userId);
    // users[userId] = socket.id;
    // console.log(socket.id);
  });

  socket.on(
    "chat message",
    (content: {
      sendAt: Date;
      pm: string;
      userId: string;
      chatId: string;
      friendId: string;
    }) => {
      content.sendAt = new Date();
      // console.log(content.userId + "me");
      // console.log(content.friendId + "he");
      // const friendSocketId = users[content.friendId];
      // console.log(friendSocketId + "            socketid");
      // console.log(users);
      // if (friendSocketId) {
      io.to(content.friendId).emit("chat message", content);
      // }
      NewMessage.save(
        new ObjectId(content.chatId),
        [new ObjectId(content.userId), new ObjectId(content.friendId)],
        {
          message: content.pm,
          sendAt: content.sendAt,
          userId: new ObjectId(content.userId),
        }
      );
    }
  );
});

app.get("/", async (req: Request, res: Response) => {
  const user = await getDB()
    .collection("users")
    .findOne({ _id: new ObjectId(req.userId) });

  if (user) {
    const chatIds: ObjectId[] = [];
    const friendsId = user.chats.map(
      (chat: { friendId: ObjectId; chatId: ObjectId }) => {
        chatIds.push(chat.chatId);
        return chat.friendId;
      }
    );
    const friends = await getDB()
      .collection("users")
      .find({ _id: { $in: friendsId } })
      .sort({ "chats.lastUpdate": -1 })
      .toArray();

    // const projection = { lastMessage: 1, lastUpdate: 1 };
    const chats = await getDB()
      .collection("messages")
      .find(
        { _id: { $in: chatIds } },
        { projection: { lastMessage: 1, lastUpdate: 1 } }
      )
      .toArray();



      for(const friend of friends){
        
      }

    // for (const friend of friends) {
    //   let trueChatIndex = friend.chats.findIndex((i: { friendId: string }) => {
    //     return req.userId == i.friendId;
    //   });
    //   friend.lastMessage = friend.chats[trueChatIndex].lastMessage;
    //   friend.lastUpdate = friend.chats[trueChatIndex].lastUpdate;
    // }

    // friends.sort((a, b) => {
    //   return b.lastUpdate - a.lastUpdate;
    // });

    res.render("client/chats", { userId: req.userId, friends: friends });
  }
});

app.get("/search", async (req: Request, res: Response) => {
  res.render("client/search");
});

app.post("/search", async (req: Request, res: Response) => {
  const username = req.body.username;
  const users = await getDB()
    .collection("users")
    .find({ username: username })
    .limit(5)
    .toArray();
  res.render("client/chats", { friends: users });
});

app.post("/:username", async (req: Request, res: Response) => {
  let chatId;
  const friendId = req.body.friendId;
  const userWithFriendId = [new ObjectId(friendId), new ObjectId(req.userId)];
  const chat = await getDB()
    .collection("messages")
    .findOne({ users: { $all: userWithFriendId } });
  if (!chat) {
    console.log("new friend");
    const message = new NewMessage(null, [
      new ObjectId(friendId),
      new ObjectId(req.userId),
    ]);
    chatId = await message.createChat();
  } else {
    console.log("old friend");
    chatId = chat._id;
  }
  res.render("client/chat", {
    chat: chat ? chat.chats : [],
    userId: req.userId,
    chatId: chatId,
    friendId: friendId,
  });
});

// app.get("/chat", async (req: Request, res: Response) => {
//   const chats = await getDB()
//     .collection("messages")
//     .findOne({ _id: new ObjectId("649d8282f801cc28ce66e637") });
//   res.render("client/chat", { userId: req.userId, chats: chats });
// });

app.get("/auth/login", (req: Request, res: Response) => {
  res.render("client/login");
});
app.post("/auth/login", async (req: Request, res: Response) => {
  const user = await getDB()
    .collection("users")
    .findOne({ username: req.body.username, password: req.body.password });
  if (user) {
    req.session.userId = user._id.toString();
    res.redirect("/chat");
  } else {
    res.send("nabod");
  }
});

server.listen(3000, () => {
  console.log("listening on port 3000");
  connectToDatabase();
});
