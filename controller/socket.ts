import NewMessage from "../model/Message";
import { Socket, Server } from "socket.io";
import { ObjectId } from "mongodb";

export default async function socket(io: Server) {
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    socket.on("register", (userId: string) => {
      socket.join(userId);
    });

    socket.on(
      "chat message",
      (content: {
        sendAt: Date;
        type: string;
        pm: string;
        userId: string;
        chatId: string;
        friendId: string;
      }) => {
        content.sendAt = new Date();
        io.to(content.friendId).emit("chat message", content);
        NewMessage.save(
          new ObjectId(content.chatId),
          [new ObjectId(content.userId), new ObjectId(content.friendId)],
          {
            message: content.pm,
            sendAt: content.sendAt,
            userId: new ObjectId(content.userId),
            type: content.type,
          }
        );
      }
    );
    socket.on(
      "sendImage",
      (content: {
        sendAt: Date;
        type: string;
        imageUrl: string;
        userId: string;
        chatId: string;
        friendId: string;
      }) => {
        content.sendAt = new Date();
        io.to(content.friendId).emit("sendImage", content);
        NewMessage.save(
          new ObjectId(content.chatId),
          [new ObjectId(content.userId), new ObjectId(content.friendId)],
          {
            message: content.imageUrl,
            sendAt: content.sendAt,
            userId: new ObjectId(content.userId),
            type: content.type,
          }
        );
      }
    );
  });
}
