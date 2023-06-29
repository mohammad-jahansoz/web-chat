import { getDB } from "../startup/db";
import { ObjectId } from "mongodb";

type message = {
  message: string;
  userId: ObjectId;
  sendAt: Date;
};

class Message {
  messages: message[] = [];
  constructor(message: string, userId: ObjectId, sendAt: Date) {
    this.messages = [{ message, userId, sendAt }];
  }
  async save() {
    await getDB().collection("messages").insertOne({ messages: this.messages });
  }
  static async addMessage(
    id: ObjectId,
    message: string,
    userId: ObjectId,
    sendAt: Date
  ) {
    await getDB()
      .collection("messages")
      .updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $push: {
            messages: {
              message: message,
              userId: new ObjectId(userId),
              sendAt: sendAt,
            },
          },
        }
      );
  }
}

export default Message;
