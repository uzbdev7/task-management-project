export const validate = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: true });
    if (error) return res.status(422).json({ message: error.details[0].message });
    next();
  };
};
