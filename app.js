const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use("/hi", (req, res) => {
  console.log("object");
  res.send("hi");
});

const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(bodyParser.json());
//mongodb
mongoose
  .connect(
    "mongodb+srv://lalkirshna00:lalkrishna00@cluster0.1m34c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/user", userRoutes);

const PORT = 7001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
