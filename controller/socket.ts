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
}
