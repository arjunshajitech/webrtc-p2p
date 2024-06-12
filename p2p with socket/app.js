const express = require('express');
const http = require('http');
const path = require("path")
const createSocketServer = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname));

const io = createSocketServer(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});