import * as dotenv from "dotenv";
import { createServer } from "./server";

dotenv.config();

const port = process.env.PORT || 6003;
const server = createServer();

server.listen(port, () => {
  console.info(`Server is running on ${port}`);
});
