import { ObjectId } from "mongodb";
import { getDB } from "../startup/db";
import { Request, Response } from "express";
import NewMessage from "../model/Message";

export async function home(req: Request, res: Response) {
  const user = await getDB()
    .collection("users")
    .findOne({ _id: new ObjectId(req.user._id) });

  if (user) {
    const chatIds: ObjectId[] = [];
    const friendsId: ObjectId[] = [];
    for (const chat of user.chats) {
      chatIds.push(chat.chatId);
      friendsId.push(chat.friendId);
    }

    const friends = await getDB()
      .collection("users")
      .find({ _id: { $in: friendsId } })
      .toArray();

    const chats = await getDB()
      .collection("messages")
      .find(
        { _id: { $in: chatIds } },
        { projection: { lastMessage: 1, lastUpdate: 1, users: 1 } }
      )
      .toArray();

    for (const friend of friends) {
      for (const chat of chats) {
        if (
          friend._id.toString() === chat.users[0].toString() ||
          friend._id.toString() === chat.users[1].toString()
        ) {
          friend.lastMessage = chat.lastMessage;
          friend.lastUpdate = chat.lastUpdate;
          break;
        }
      }
    }

    friends.sort((a, b) => {
      return b.lastUpdate - a.lastUpdate;
    });
    res.render("client/chats", { friends: friends });
  }
}

export function getSearch(req: Request, res: Response) {
  res.render("client/search");
}

export async function postSearch(req: Request, res: Response) {
  const payload = req.body.payload;
  console.log(payload);
  let result = await getDB()
    .collection("users")
    .find({
      _id: { $ne: req.user._id },
      username: { $regex: new RegExp("^" + payload + ".*", "i") },
    })
    .limit(5)
    .toArray();
  res.send({ payload: result });
}

export async function sendMessage(req: Request, res: Response) {
  let chatId;
  const friend = await getDB()
    .collection("users")
    .findOne({ _id: new ObjectId(req.body.friendId) });
  const userWithFriendId = [
    new ObjectId(friend?._id),
    new ObjectId(req.user._id),
  ];
  const chat = await getDB()
    .collection("messages")
    .findOne({ users: { $all: userWithFriendId } });
  if (!chat) {
    // console.log("new friend");
    const message = new NewMessage(null, [
      new ObjectId(friend?._id),
      new ObjectId(req.user._id),
    ]);
    chatId = await message.createChat();
  } else {
    // console.log("old friend");
    chatId = chat._id;
  }
  res.render("client/chat", {
    chat: chat ? chat.chats : [],
    chatId: chatId,
    friend: friend,
  });
}

export async function upload(req: Request, res: Response) {}
