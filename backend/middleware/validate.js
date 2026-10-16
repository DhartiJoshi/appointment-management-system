const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const err = new Error(error.details.map((d) => d.message).join(", "));
    err.statusCode = 400;
    return next(err);
  }

  req.body = value;
  next();
};

module.exports = validate;
