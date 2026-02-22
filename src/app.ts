import express from "express";
import router from "./routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/v1", router);

export default app;
