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
  users: ObjectId[] = [];
  constructor(
    message: string,
    userId: ObjectId,
    sendAt: Date,
    _id: ObjectId | null
    // peoples: ObjectId[]
  ) {
    this._id = _id;
    this.messages = [{ message, userId, sendAt }];
    // this.peoples = peoples;
  }
  async save() {
    if (!this._id) {
      await getDB()
        .collection("messages")
        .insertOne({ messages: this.messages });
      //save id of chat in user collection
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
