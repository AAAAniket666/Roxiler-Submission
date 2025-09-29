const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    
    if (!dataToValidate) {
      return res.status(400).json({
        success: false,
        message: `No ${property} data provided for validation.`,
      });
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace the original data with the validated and sanitized data
    req[property] = value;
    next();
  };
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/^\s+|\s+$/g, '') // Remove leading/trailing whitespace
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

module.exports = {
  validate,
  sanitizeInput,
};