require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");

const doctorsData = [
  {
    name: "Dr. Anita Sharma",
    specialization: "Cardiologist",
    status: "Active",
  },
  { name: "Dr. Rahul Mehta", specialization: "Orthopedic", status: "Active" },
  {
    name: "Dr. Priya Patel",
    specialization: "Dermatologist",
    status: "Active",
  },
  { name: "Dr. Suresh Nair", specialization: "Pediatrician", status: "Active" },
  { name: "Dr. Kavita Rao", specialization: "ENT", status: "Inactive" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Default admin (created only if missing)
    const email = "admin@example.com";
    if (!(await Admin.findOne({ email }))) {
      await Admin.create({ email, password: "Admin@123" });
      console.log("Default admin created: admin@example.com / Admin@123");
    } else {
      console.log("Default admin already exists");
    }

    // Sample doctors and appointments (only if there are no doctors yet)
    if ((await Doctor.countDocuments()) === 0) {
      const doctors = await Doctor.insertMany(doctorsData);

      await Appointment.insertMany([
        {
          firstName: "Amit",
          lastName: "Verma",
          mobile: "9876543210",
          email: "amit@example.com",
          doctor: doctors[0]._id,
          serviceType: "New Case",
          appointmentDate: "2026-10-20",
          appointmentTime: "10:15",
          notes: "First visit",
          status: "Pending",
        },
        {
          firstName: "Neha",
          lastName: "Shah",
          mobile: "9123456780",
          email: "neha@example.com",
          doctor: doctors[1]._id,
          serviceType: "Follow Up",
          appointmentDate: "2026-10-22",
          appointmentTime: "11:30",
          notes: "Review",
          status: "Completed",
        },
        {
          firstName: "Rohan",
          lastName: "Desai",
          mobile: "9988776655",
          email: "rohan@example.com",
          doctor: doctors[2]._id,
          serviceType: "Consultation",
          appointmentDate: "2026-10-25",
          appointmentTime: "15:45",
          notes: "",
          status: "Cancelled",
        },
      ]);
      console.log("Sample doctors and appointments created");
    } else {
      console.log("Doctors already exist, skipping sample data");
    }
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
