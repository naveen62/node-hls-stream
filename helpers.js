const ffmpeg = require("fluent-ffmpeg");
const  path = require('node:path') 
const fs = require('node:fs') 
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);


const getResolutionBandwidth = (resolution) => {
  if (resolution == "320x180") return "676800";
  if (resolution == "854x480") return "1353600";
  if (resolution == "1280x720") return "3230400";
};

const encodeVideo = (path, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let encodedResCount = 0;
      const resolutions = [
        {
          resolution: "320x180",
          videoBitrate: "500k",
          audioBitrate: "64k",
        },
        {
          resolution: "854x480",
          videoBitrate: "1000k",
          audioBitrate: "128k",
        },
        {
          resolution: "1280x720",
          videoBitrate: "2500k",
          audioBitrate: "192k",
        },
      ];
      const masterPlaylist = ["#EXTM3U"];
      for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
        const outputFile = `${fileName.replace(".", "_")}_${resolution}.m3u8`;

        ffmpeg(path)
          .outputOptions([
            `-c:v h264`,
            `-b:v ${videoBitrate}`,
            `-c:a aac`,
            `-b:a ${audioBitrate}`,
            `-vf scale=${resolution}`,
          ])
          .output(`hls/${outputFile}`)
          .addOptions(["-hls_playlist_type", "vod"]) 
          .on("end", () => {
            encodedResCount++;
            if (encodedResCount === 3) {
              resolve(true);
            }
          })
          .on("error", (err) => reject(err))
          .run();
          
          masterPlaylist.push(
            `#EXT-X-STREAM-INF:BANDWIDTH=${getResolutionBandwidth(
              resolution,
            )},RESOLUTION=${resolution}\n${outputFile}`,
          );
          if (!fs.existsSync('hls')) {
            fs.mkdirSync('hls', { recursive: true });
          }
          fs.writeFileSync(`hls/${fileName}.m3u8`, masterPlaylist.join("\n"));
      }
    } catch (error) {
        reject(error);
    }
  });
};

module.exports = {
    encodeVideo
}
