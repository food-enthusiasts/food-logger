import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("hello");
});

app.listen(5050, () => console.log("server running"));