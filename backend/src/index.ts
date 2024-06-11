import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("hello");
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(5050, () => console.log("server running"));
