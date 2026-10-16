const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const notFound = () => {
  const error = new Error("Doctor not found");
  error.statusCode = 404;
  return error;
};

// GET /api/doctors
exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find().sort({ createdAt: -1 });
  res.json({ success: true, count: doctors.length, data: doctors });
};

// GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw notFound();
  res.json({ success: true, data: doctor });
};

// POST /api/doctors
exports.createDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, data: doctor });
};

// PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) throw notFound();
  res.json({ success: true, data: doctor });
};

// DELETE /api/doctors/:id
exports.deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw notFound();

  const hasAppointments = await Appointment.exists({ doctor: doctor._id });
  if (hasAppointments) {
    const error = new Error(
      "This doctor has appointments and cannot be deleted. Delete or reassign their appointments first, or set the doctor to Inactive.",
    );
    error.statusCode = 400;
    throw error;
  }

  await doctor.deleteOne();
  res.json({ success: true, message: "Doctor deleted successfully" });
};
