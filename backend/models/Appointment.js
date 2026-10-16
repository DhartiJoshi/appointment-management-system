const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    serviceType: {
      type: String,
      enum: ["New Case", "Follow Up", "Consultation", "Other"],
      required: [true, "Service type is required"],
    },
    appointmentDate: {
      type: String, // stored as YYYY-MM-DD
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String, // stored as HH:mm (24-hour)
      required: [true, "Appointment time is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

// Backup protection: the database itself refuses two appointments for the
// same doctor, date and time. Cancelled ones are excluded so the slot can be reused.
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "Cancelled" } },
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
