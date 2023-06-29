import { getDB } from "../startup/db";
import { ObjectId } from "mongodb";

type message = {
  message: string;
  userId: ObjectId;
  sendAt: Date;
};

class Message {
  messages: message[] = [];
  _id: ObjectId | null;
  constructor(
    message: string,
    userId: ObjectId,
    sendAt: Date,
    _id: ObjectId | null
  ) {
    this._id = _id;
    this.messages = [{ message, userId, sendAt }];
  }
  async save() {
    if (!this._id) {
      await getDB()
        .collection("messages")
        .insertOne({ messages: this.messages });
    } else {
      await getDB()
        .collection("messages")
        .updateOne(
          {
            _id: new ObjectId(this._id),
          },
          {
            $push: {
              messages: {
                ...this.messages[0],
              },
            },
          }
        );
    }
  }
}

export default Message;
