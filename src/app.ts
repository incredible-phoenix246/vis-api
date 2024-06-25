import express from "express";
import cors from "cors";
import https from "https";
import cron from "node-cron";
import { sayHelloController } from "./controllers";
import { errorHandler } from "./middlewares";
import { userrouter } from "./routes/user";
import { orderRouter } from "./routes/order";
import { notRoute } from "./routes/notification";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = ["http://localhost:3000", "https://viscio.vercel.app"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

function keepAlive(url: string) {
  https
    .get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
    })
    .on("error", (error) => {
      console.error(`Error: ${error.message}`);
    });
}

cron.schedule("*/5 * * * *", () => {
  keepAlive("");
  console.log("Pinging the server every 5 minutes");
});

app.get("/", sayHelloController);
app.use("/api/user", userrouter);
app.use("/api/order", orderRouter);
app.use("/api", notRoute);

app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
