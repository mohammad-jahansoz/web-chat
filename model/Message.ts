import { getDB } from "../startup/db";
import { ObjectId } from "mongodb";

type message = {
  message: string;
  userId: ObjectId;
  sendAt: Date;
  type: string;
};

class Message {
  chats: message[] = [];
  _id: ObjectId | null;
  users: ObjectId[] = [];
  constructor(_id: ObjectId | null, users: ObjectId[]) {
    this._id = _id;
    this.users = users;
  }
  async createChat() {
    // create document of chat and save id of users in chat
    const result = await getDB()
      .collection("messages")
      .insertOne({ users: this.users, chats: this.chats });

    // save id of chat and id of friend in user doc
    // loop for all users in chat
    for (const userId of this.users) {
      // find friends id
      let friendId;
      for (const user of this.users) {
        // id of friend is not equal with id of user
        if (user.toString() != userId.toString()) {
          friendId = user;
        }
      }
      await getDB()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $push: {
              chats: {
                chatId: new ObjectId(result.insertedId),
                friendId: new ObjectId(friendId),
              },
            },
          }
        );
    }
    return result.insertedId;
  }
  static async save(chatId: ObjectId, usersId: ObjectId[], message: message) {
    await getDB()
      .collection("messages")
      .updateOne(
        { _id: new ObjectId(chatId) },
        {
          $push: {
            chats: message,
          },
          $set: {
            lastMessage: message.message,
            lastUpdate: message.sendAt,
          },
        }
      );
  }
}

export default Message;
