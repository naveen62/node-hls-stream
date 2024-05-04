const express = require("express");
const app = express();
const port = 3000;
const multer = require("multer");
const fs = require("node:fs");
const upload = multer({
  dest: "videos-upload/",
  fileFilter: (req, file, cb) => {
    if(file.mimetype.includes('video')) {
      cb(null, true)
      return
    }
    cb(new Error('Invalid upload format'))
  },
});

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

app.get("/hls/:file", async (req, res) => {
  try {
    const file = req.params.file;
    fs.readFile(`hls/${file}`, (err, data) => {
      if(err) {
        res.status(400);
        return
      }
      res.send(data);
    });
  } catch (error) {
    res.statusCode(400);
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
