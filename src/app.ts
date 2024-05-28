import express from "express";
import { readdirSync } from "fs";
import cors from "cors";
import https from "https";
import cron from "node-cron";
import { sayHelloController } from "./controllers";
import { errorHandler } from "./middlewares";
import { userrouter } from "./routes/user";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function keepAlive(url: string) {
  https
    .get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
    })
    .on("error", (error) => {
      console.error(`Error: ${error.message}`);
    });
}

// cron job to ping the server every minute and delete expired tokens every 5 minutes
cron.schedule("*/5 * * * *", () => {
  keepAlive("");
  console.log("pinging the server every minute");
});

//serve all routes dynamically using readdirsync

app.get("/", sayHelloController);
app.use("/api/user", userrouter);

app.use(errorHandler);

app.use(cors());
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
