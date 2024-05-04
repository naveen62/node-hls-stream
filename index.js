const express = require("express");
const app = express();
const port = 3000;
const multer = require("multer");
const upload = multer({ dest: "videos-upload/" });
const fs = require('node:fs') 

const { encodeVideo } = require("./helpers");

app.post("/video-upload", upload.single("video"), async (req, res) => {
  try {
    encodeVideo(req.file.path, req.file.filename);
    res.send({
      result: "encoding started",
    });
  } catch (error) {
    res.statusCode(400);
  }
});

app.get('/play/:file', async (req, res) => {
  try {
    const file = req.params.file;
    fs.readFile(`hls/${file}`, (err, data) => {
      res.send(data);
    })
  } catch (error) {
    res.statusCode(400);
    console.log(error);
  }
})


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
