const express = require("express");
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { appointmentSchema } = require("../validators/appointmentValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAppointments)
  .post(validate(appointmentSchema), createAppointment);

router
  .route("/:id")
  .get(getAppointment)
  .put(validate(appointmentSchema), updateAppointment)
  .delete(deleteAppointment);

module.exports = router;
