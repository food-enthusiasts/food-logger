import express from "express";

const app = express();
// tested with CURL, if I don't specify content-type as json, seems
// like CURL defaults to x-www-form-urlencoded content type for POST
// need to also parse x-www-form-urlencoded request bodies? when would those get set?
// sent by an html form with POST set as the method?
app.use(express.json());

app.get("/", (_, res) => {
  res.send("hello");
});

app.post("/", (req, res) => {
  console.log("req headers", JSON.stringify(req.headers));
  console.log("have req.body?", req.body);
  res.send("posted \n");
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(5050, () => console.log("server running"));
