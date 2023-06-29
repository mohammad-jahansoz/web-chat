import { getDB } from "../startup/db";
import { ObjectId } from "mongodb";

type message = {
  message: string;
  userId: ObjectId;
  sendAt: Date;
};

class Message {
  messages: message[] = [];
  _id: ObjectId;
  constructor(_id: ObjectId, message: string, userId: ObjectId, sendAt: Date) {
    this._id = _id;
    this.messages = [{ message, userId, sendAt }];
  }
  async save() {
    if (this._id) {
      await getDB()
        .collection("messages")
        .insertOne({ messages: this.messages });
    } else {
      // async addMessage(
      //     id: ObjectId,
      //     message: string,
      //     userId: ObjectId,
      //     sendAt: Date
      //   ) {
      await getDB()
        .collection("messages")
        .updateOne(
          {
            _id: new ObjectId(this._id),
          },
          {
            $push: {
              messages: {
                message: this.messages,
                userId: new ObjectId(userId),
                sendAt: sendAt,
              },
            },
          }
        );
    }
  }
}

// }

export default Message;
