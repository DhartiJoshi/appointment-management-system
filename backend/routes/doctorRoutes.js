const express = require("express");
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { doctorSchema } = require("../validators/doctorValidator");

const router = express.Router();

router.use(protect);

router.route("/").get(getDoctors).post(validate(doctorSchema), createDoctor);

router
  .route("/:id")
  .get(getDoctor)
  .put(validate(doctorSchema), updateDoctor)
  .delete(deleteDoctor);

module.exports = router;
