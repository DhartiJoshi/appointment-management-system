const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Overlap check: same doctor + same date + same time (cancelled ones don't block)
const ensureSlotFree = async (
  { doctor, appointmentDate, appointmentTime },
  excludeId,
) => {
  const query = {
    doctor,
    appointmentDate,
    appointmentTime,
    status: { $ne: "Cancelled" },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const clash = await Appointment.findOne(query);
  if (clash) {
    throw httpError(
      "This doctor already has an appointment at the selected date and time",
      409,
    );
  }
};

const ensureDoctorExists = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw httpError("Doctor not found", 404);
};

// GET /api/appointments?search=&doctor=&status=&fromDate=&toDate=
exports.getAppointments = async (req, res) => {
  const { search, doctor, status, fromDate, toDate } = req.query;
  const filter = {};

  if (doctor) filter.doctor = doctor;
  if (status) filter.status = status;

  if (fromDate || toDate) {
    filter.appointmentDate = {};
    if (fromDate) filter.appointmentDate.$gte = fromDate;
    if (toDate) filter.appointmentDate.$lte = toDate;
  }

  if (search && search.trim()) {
    const pattern = escapeRegex(search.trim());
    filter.$or = [
      { mobile: { $regex: pattern, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ["$firstName", " ", "$lastName"] },
            regex: pattern,
            options: "i",
          },
        },
      },
    ];
  }

  const appointments = await Appointment.find(filter)
    .populate("doctor", "name specialization status")
    .sort({ appointmentDate: -1, appointmentTime: 1 });

  res.json({ success: true, count: appointments.length, data: appointments });
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    "doctor",
    "name specialization status",
  );
  if (!appointment) throw httpError("Appointment not found", 404);
  res.json({ success: true, data: appointment });
};

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  await ensureDoctorExists(req.body.doctor);
  if (req.body.status !== "Cancelled") await ensureSlotFree(req.body);

  const appointment = await Appointment.create(req.body);
  await appointment.populate("doctor", "name specialization status");
  res.status(201).json({ success: true, data: appointment });
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  const existing = await Appointment.findById(req.params.id);
  if (!existing) throw httpError("Appointment not found", 404);

  await ensureDoctorExists(req.body.doctor);
  if (req.body.status !== "Cancelled") {
    await ensureSlotFree(req.body, req.params.id);
  }

  existing.set(req.body);
  await existing.save();
  await existing.populate("doctor", "name specialization status");
  res.json({ success: true, data: existing });
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) throw httpError("Appointment not found", 404);
  res.json({ success: true, message: "Appointment deleted successfully" });
};
