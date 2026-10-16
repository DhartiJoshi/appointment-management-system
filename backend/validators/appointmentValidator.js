const Joi = require("joi");

const dateRule = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const d = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "string.pattern.base": "Appointment date must be in YYYY-MM-DD format",
    "any.invalid": "Appointment date is not a valid date",
  });

exports.appointmentSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().required().messages({
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base": "Mobile number must be exactly 10 digits",
      "any.required": "Mobile number is required",
    }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
  doctor: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Doctor is required",
      "string.pattern.base": "Invalid doctor",
      "any.required": "Doctor is required",
    }),
  serviceType: Joi.string()
    .valid("New Case", "Follow Up", "Consultation", "Other")
    .required()
    .messages({
      "any.only":
        "Service type must be New Case, Follow Up, Consultation or Other",
      "any.required": "Service type is required",
    }),
  appointmentDate: dateRule.required().messages({
    "any.required": "Appointment date is required",
    "string.empty": "Appointment date is required",
  }),
  appointmentTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):(00|15|30|45)$/)
    .required()
    .messages({
      "string.empty": "Appointment time is required",
      "string.pattern.base":
        "Appointment time must be in 15-minute intervals (e.g. 10:00, 10:15, 10:30, 10:45)",
      "any.required": "Appointment time is required",
    }),
  notes: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("Pending", "Completed", "Cancelled").optional(),
});
