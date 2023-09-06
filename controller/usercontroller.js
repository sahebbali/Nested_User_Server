const User = require("../models/user");
const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const createRootUser = async (username, password) => {
  const newUser = new User({
    username,
    password,
    isRoot: true,
  });

  await newUser.save();
  return newUser;
};

// Function to create a new child user
const createChildRoot = async (username, password, rootChild) => {
  const newUser = new User({
    username,
    password,
    parent: rootChild,
  });

  await newUser.save();
  return newUser;
};
// Function to create a new child user
const createChildUser = async (username, password, parentUser) => {
  const newUser = new User({
    username,
    password,
    parent: parentUser,
  });

  await newUser.save();
  return newUser;
};
const updateParent = async (c, userId) => {
  const updateResult = await User.updateOne(
    { _id: userId },
    { $set: { count: c } }
  );
  return updateResult;
};
// Function to dynamically assign root users to children
const assignRootUserToChild = async (username, password) => {
  // Find the current root user with the least number of children
  let rootUser = await User.aggregate([
    {
      $match: { isRoot: true },
    },
    {
      $lookup: {
        from: "users", // Replace with the actual collection name
        localField: "_id",
        foreignField: "parent",
        as: "children",
      },
    },
    {
      $addFields: {
        numChildren: { $size: "$children" },
      },
    },
    {
      $sort: { numChildren: 1 },
    },
    {
      $limit: 1,
    },
  ]);
  // console.log(rootUser);

  // ############ if no ROOT
  if (!rootUser || rootUser.length === 0) {
    console.log("If executing");
    // Create a new root user if there is no existing root or the current root has 4 children
    rootUser = await createRootUser(username, password);
    return rootUser;
  }

  // If Root
  else {
    // rootUser = rootUser[0]; // no need

    const lastData = await User.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (lastData[0].count < 4) {
      const parentId = lastData[0].parent;

      if (parentId == undefined) {
        const newUser = await createChildUser(
          username,
          password,
          rootUser[0]._id
        );
        const rootid = rootUser[0]._id.toString();
        const c = lastData[0].count + 1;
        const done = updateParent(c, rootid);
        if (done) {
          return newUser;
        }
      } else if (parentId) {
        const objectId = parentId._id.toString();
        const userdata = await User.findById(objectId);
        if (userdata.count < 4) {
          const newUser = await createChildUser(username, password, parentId);
          const changeId = userdata._id.toString();
          const c = userdata.count + 1;
          const done = updateParent(c, changeId);
          if (done) {
            return newUser;
          }
        } else if (userdata.count == 4) {
          const providedTimestamp = userdata.createdAt;
          const nextUser = await User.findOne({
            createdAt: { $gt: providedTimestamp },
          })
            .sort({ createdAt: 1 })
            .exec();
          const nextId = nextUser._id.toString();

          const newUser = await createChildUser(username, password, nextId);
          const c = nextUser.count + 1;
          const done = updateParent(c, nextId);
          if (done) {
            return newUser;
          }
        }
      }
    }
  }

  // Check if the current root has 4 children after creating the new one
};

const Signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Assign the user to a root or child user based on the hierarchy logic
    const newUser = await assignRootUserToChild(username, password);

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAll = async (req, res) => {
  User.deleteMany({})
    .then((result) => {
      console.log(`Deleted ${result.deletedCount} documents`);
    })
    .catch((error) => {
      console.error("Error deleting documents:", error);
    })
    .finally(() => {
      // Close the MongoDB connection
      mongoose.connection.close();
    });
};

const getAllData = async (req, res) => {
  const Data = await User.find({});
  res.status(201).json({ message: "data: ", Data });
};

const getDataById = async (req, res) => {
  try {
    const itemId = req.params.id;

    const result = await User.findOne({ _id: itemId });

    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Return the retrieved data as JSON
    res.json({ message: "data:" }, result);
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getDataById };

module.exports = {
  Signup,
  deleteAll,
  getAllData,
  getDataById,
};
