const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let conf = {
  http_api: {
    enabled: true,
    host: "0.0.0.0",
    port: 5000,
  },
  database: true,
  views: 10,
  minimum: 85.0,
  maximum: 95.0,
  proxy: {
    category: "f",
    proxy_type: "http",
    filename: "GoodProxy.txt",
    authentication: false,
    proxy_api: false,
    refresh: 0.0,
  },
  background: false,
  bandwidth: true,
  playback_speed: 1,
  max_threads: 5,
  min_threads: 2,
};

const proxyList = ["49.48.41.11:3128", "  49.48.41.11:3129"];

app.post("/", (req, res) => {
  let { searchTxt, video_id, url } = req.body;
  console.log(req.body);
  let proxyTxt = "";

  if (proxyList.length > 0) {
    proxyList.map((item) => {
      proxyTxt += item + "\n";
    });
  }

  writeFile("myproxy.txt", proxyTxt);
  writeFile("urls.txt", url);
  fs.writeFileSync('config.json', JSON.stringify(conf, null, 2) , 'utf-8');
  writeFile("search.txt", `${searchTxt} :::: ${video_id}`);

  // var dataToSend;
  // // spawn new child process to call the python script
  const python = spawn("python3", ["proxy_check.py"]);

  // collect data from script
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });

  //   in close event we are sure that stream from child process is closed
  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend);
  });
});

const writeFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

app.listen(port, () => console.log(`App running at port: ${port}!`));
