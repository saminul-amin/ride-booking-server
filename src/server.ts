import { Server } from "http";
import app from "./app";

let server: Server;

const startServer = async () => {
  try {
    server = app.listen(3000, () => {
      console.log("Server is running on port 3000!");
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
})();
