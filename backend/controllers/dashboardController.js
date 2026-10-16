const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// GET /api/dashboard?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
exports.getDashboardStats = async (req, res) => {
  const { fromDate, toDate } = req.query;
  const filter = {};

  if (fromDate || toDate) {
    filter.appointmentDate = {};
    if (fromDate) filter.appointmentDate.$gte = fromDate;
    if (toDate) filter.appointmentDate.$lte = toDate;
  }

  const [totalDoctors, totalAppointments, pending, completed, cancelled] =
    await Promise.all([
      Doctor.countDocuments(),
      Appointment.countDocuments(filter),
      Appointment.countDocuments({ ...filter, status: "Pending" }),
      Appointment.countDocuments({ ...filter, status: "Completed" }),
      Appointment.countDocuments({ ...filter, status: "Cancelled" }),
    ]);

  res.json({
    success: true,
    data: {
      totalDoctors,
      totalAppointments,
      pendingAppointments: pending,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
    },
  });
};
