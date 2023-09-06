const express = require("express");
const mongoose = require("mongoose");
const userRouter = require('./route/userRoute')

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(userRouter);

app.get("/", (_req, res) => {
  const obj = {
    msg: "Wellcome to our Application",
  };
  res.json(obj);
});

mongoose
  .connect(
    "mongodb+srv://sahebbali253:saheb123@cluster0.o5vsdqv.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
