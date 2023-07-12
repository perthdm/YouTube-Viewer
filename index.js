const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let conf = (view_expect) => {
  view_expect = view_expect ? view_expect : 1;
  return {
    http_api: {
      enabled: true,
      host: "0.0.0.0",
      port: 5000,
    },
    database: true,
    views: view_expect,
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
};

app.post("/confirm-order", (req, res) => {
  let { search_txt, video_url, video_id, view_expect, good_proxy } = req.body;

  writeFile("urls.txt", video_url);
  writeFile("search.txt", `${search_txt} :::: ${video_id}`);
  fs.writeFileSync(
    "config.json",
    JSON.stringify(conf(view_expect), null, 2),
    "utf-8"
  );

  let proxyTxt = "";
  if (!good_proxy) {
    good_proxy = ["49.48.45.94:3129", "49.48.45.94:3130"];
  }

  good_proxy.map((item) => {
    proxyTxt += item + "\n";
  });

  writeFile("GoodProxy.txt", proxyTxt);

  const pythonProcess = spawn("python3", ["youtube_viewer.py"], {
    stdio: "inherit",
  });

  console.log("Python process name:", pythonProcess.pid);

  // Optional: Handle process exit
  pythonProcess.on("exit", (code, signal) => {
    console.log(code);
    console.log(`Python process exited with code ${code} and signal ${signal}`);
  });

  res.json(true);
});

const writeFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

app.listen(port, () => console.log(`App running at port: ${port}!`));
