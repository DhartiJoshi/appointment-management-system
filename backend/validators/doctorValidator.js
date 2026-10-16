const Joi = require("joi");

exports.doctorSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Doctor name is required",
    "any.required": "Doctor name is required",
  }),
  specialization: Joi.string().trim().required().messages({
    "string.empty": "Specialization is required",
    "any.required": "Specialization is required",
  }),
  status: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "Status must be Active or Inactive",
  }),
});
