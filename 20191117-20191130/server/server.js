const path = require("path");
const url = require("url");
const fs = require("fs");
const http = require("http");
const mime = require("mime");
const marked = require("marked");

let root = path.resolve("server/catalog");

console.log(`Root dir: ${root}`);

let server = http.createServer(function (request, response) {
  let pathname = url.parse(request.url).pathname;
  if (pathname === "/") {
    pathname = "/1.html";
  }
  //文件的本地文件路径
  let filepath = path.join(root, pathname);
  let ext = path.parse(filepath).ext;
  let mimeType = mime.getType(ext) || "";
  console.log("Type:", mimeType, filepath);
  console.log(request.headers);

  //处理非文本文件
  if (mimeType && !mimeType.startsWith("text")) {
    let range = request.headers.range || "bytes=0-";
    let positions = range.replace("bytes=", "").split("-");
    let start = parseInt(positions[0], 10);
    fs.stat(filepath, function (err, stat) {
      if (err) {
        response.end("<h1>404 Not Found</h1>");
      }
      else {
        let total = stat.size;
        let end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        let chunkSize = (end - start) + 1;
        response.writeHead(206, {
          "Content-Type": mimeType,
          "Content-Length": chunkSize,
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Accept-Ranges": "bytes"
        });
        let stream = fs.createReadStream(filepath, { start: start, end: end })
          .on("error", function () {
            response.writeHead(500, { "Content-Type": mimeType });
            response.end("<h1>500 Server Error</h1>");
          })
          .on("open", function () {
            stream.pipe(response);
          })
      }
    });

  }
  //处理文本文件
  else {
    fs.readFile(filepath, "utf-8", function (err, data) {
      if (!err) {
        console.log("200" + request.url);
        //处理markdown
        if (mimeType === "text/markdown") {
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.write(marked(data));
        }
        //处理其他文本文件
        else {
          response.writeHead(200, { "Content-Type": mimeType });
          response.write(data);
        }
        response.end();
      }
      else {
        console.log("404" + request.url);
        response.writeHead(404);
        response.end("<h1>404 Not Found</h1>");
      }
    });
  }


});

server.listen(1027);
console.log("Server is running at http://127.0.0.1:1027");