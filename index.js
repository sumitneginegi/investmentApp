const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const http = require('http');
const server = http.createServer(app);

const bodyparser = require("body-parser");

app.use(cors({
  origin :"*",
}));

const customer = require("./route/user/user")
const plan = require("./route/user/plan")
const paymentt = require("./route/user/payment")

require("dotenv").config();
const socketIo = require('socket.io');

// Initialize Socket.io and pass the HTTP server
const io = socketIo(server);

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8081;

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("Db connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// Set up your routes before applying CORS middleware
app.get("/home", (req, res) => {
  res.status(200).send({ msg: "Working App" });
});


io.on('connection', (socket) => { 
  console.log('A user connected')

  // Example: Send a welcome message to the connected client
  socket.emit('welcome', 'Welcome to the Socket.io server!');

  // ... (add your Socket.io event handling logic here)
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  })
})

app.use("/api/v1/customer",customer);
app.use("/api/v1/plan",plan)
app.use("/api/v1/payment",paymentt)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});








