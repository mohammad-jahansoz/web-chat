import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../startup/db";

export function getLogin(req: Request, res: Response) {
  res.render("client/login");
}

export async function postLogin(req: Request, res: Response) {
  const user = await getDB()
    .collection("users")
    .findOne({ username: req.body.username, password: req.body.password });
  if (user) {
    req.session.userId = user._id.toString();
    res.redirect("/chat");
  } else {
    res.send("nabod");
  }
}
