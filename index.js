const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbPath = "database.db";

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

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
    good_proxy = ["49.48.40.82:3129", "171.6.73.223:3130"];
  }

  good_proxy.map((item) => {
    proxyTxt += item + "\n";
  });

  writeFile("GoodProxy.txt", proxyTxt);

  const pythonProcess = spawn("python", ["youtube_viewer.py"], {
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

app.get("/data", (req, res) => {
  // const query = "SELECT * FROM statistics;";
  const query = 'SELECT SUM(view) AS total FROM statistics;';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Send the data as a JSON response
      res.json(rows);
    }
  });
});

app.delete("/data", (req, res) => {
  const query = "DELETE FROM statistics;";

  db.run(query, [], (err) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "All records deleted successfully" });
    }
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
