import express, { Express, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectToDatabase, getDB } from "./startup/db";

import Message from "./model/saveMessages";
import { ObjectId } from "mongodb";
dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "views");

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("chat message", (message) => {
    console.log("Received message:", message);
    socket.broadcast.emit("chat message", message);
  });
});

app.get("/chat", async (req: Request, res: Response) => {
  res.render("client/chat");
});
app.get("/test", async (req: Request, res: Response) => {
  // const message = new Message(
  //   "test",
  //   new ObjectId("649d816eefb84deb00067ca0"),
  //   new Date(),
  // null
  // );
  // await message.save();
  //
  const message = new Message(
    "dadash man toeiiiiiiiiiiii",
    new ObjectId("649d816eefb84deb00067ca0"),
    new Date(),
    new ObjectId("649d8282f801cc28ce66e637")
  );
  await message.save();
});

server.listen(3000, () => {
  connectToDatabase();
  console.log("listening on port 3000");
});
