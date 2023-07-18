import { Request } from "express";
import multer from "multer";
type DestinationCallback = (error: Error | null, destination: string) => void;
// type FileNameCallback = (error: Error | null, filename: string) => void;
const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): void => {
    callback(null, "/public/images/chats");
  },
  // filename: (
  //   req: Request,
  //   file: Express.Multer.File,
  //   callback: FileNameCallback
  // ): void => {
  //   // ...Do your stuff here.
  // },
});

export default multer({ storage: storage });
