const { default: mongoose } = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();


const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("DAtabase error");
  }
};
module.exports = dbConnect;