const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const PythonShell = require("python-shell").PythonShell;

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

app.get("/", (req, res) => {
  // const proxyList = [
  //   "171.6.73.223:3128",
  //   "171.6.73.223:3129",
  //   "171.6.73.223:3130",
  // ];

  // let proxyTxt = "";
  // if (proxyList.length > 0) {
  //   proxyList.map((item) => {
  //     proxyTxt += item + "\n";
  //   });
  // }

  // writeFile("myproxy.txt", proxyTxt);

  const python = spawn("python3", ["proxy_check.py"], {
    stdio: "inherit",
  });

  // Optional: Handle process exit
  python.on("exit", (code, signal) => {
    console.log(`Python process exited with code ${code} and signal ${signal}`);
    res.send("ALREADY CREATE FILE GOOD PROXY");
  });
});

app.post("/", (req, res) => {
  let { search_txt, video_url, video_id } = req.body;

  writeFile("urls.txt", video_url);
  writeFile("search.txt", `${search_txt} :::: ${video_id}`);
  fs.writeFileSync("config.json", JSON.stringify(conf, null, 2), "utf-8");

  const python = spawn("python3", ["youtube_viewer.py"], {
    stdio: "inherit",
  });

  // Optional: Handle process exit
  python.on("exit", (code, signal) => {
    console.log(code);
    console.log(`Python process exited with code ${code} and signal ${signal}`);
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
