const router = require("express").Router();
const {
  Signup,
  deleteAll,
  getDataById,
  getAllData,
} = require("../controller/usercontroller");

router.post("/api/v1/singup", Signup);
router.get("/api/v1/getalldata", getAllData);
router.get("/api/v1/getDatabyId/:id", getDataById);
router.delete("/api/v1/alldelete", deleteAll);
module.exports = router;
