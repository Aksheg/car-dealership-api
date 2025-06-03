import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const carValidationSchema = Joi.object({
  brand: Joi.string().required().trim().min(1).max(50),
  model: Joi.string().required().trim().min(1).max(50),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required(),
  price: Joi.number().min(0).required(),
  color: Joi.string().required().trim().min(1).max(30),
  mileage: Joi.number().min(0).required(),
  fuelType: Joi.string()
    .valid("gasoline", "diesel", "electric", "hybrid")
    .required(),
  transmission: Joi.string().valid("manual", "automatic").required(),
  bodyType: Joi.string().required().trim().min(1).max(30),
  engine: Joi.string().required().trim().min(1).max(50),
  features: Joi.array().items(Joi.string().trim()),
  isAvailable: Joi.boolean(),
  category: Joi.string().hex().length(24).required(),
  images: Joi.array().items(Joi.string().uri()),
  description: Joi.string().trim().max(1000),
});

const carUpdateValidationSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(50).optional(),
  model: Joi.string().trim().min(1).max(50).optional(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  price: Joi.number().min(0).optional(),
  color: Joi.string().trim().min(1).max(30).optional(),
  mileage: Joi.number().min(0).optional(),
  fuelType: Joi.string()
    .valid("gasoline", "diesel", "electric", "hybrid")
    .optional(),
  transmission: Joi.string().valid("manual", "automatic").optional(),
  bodyType: Joi.string().trim().min(1).max(30).optional(),
  engine: Joi.string().trim().min(1).max(50).optional(),
  features: Joi.array().items(Joi.string().trim()).optional(),
  isAvailable: Joi.boolean().optional(),
  category: Joi.string().hex().length(24).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  description: Joi.string().trim().max(1000).optional(),
});

const userValidationSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required().trim().min(1).max(50),
  lastName: Joi.string().required().trim().min(1).max(50),
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/),
  role: Joi.string().valid("customer", "manager", "admin"),
});

const userProfileUpdateSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('', null),
});

const customerProfileUpdateSchema = userProfileUpdateSchema.keys({
  address: Joi.object({
    street: Joi.string().trim().min(1).max(100).optional(),
    city: Joi.string().trim().min(1).max(50).optional(),
    state: Joi.string().trim().min(1).max(50).optional(),
    zipCode: Joi.string().trim().min(1).max(20).optional(),
    country: Joi.string().trim().min(1).max(50).optional(),
  }).optional(),
  preferredBrands: Joi.array().items(Joi.string().trim()).optional(),
  drivingLicense: Joi.string().trim().max(50).optional().allow('', null),
});

const managerProfileUpdateSchema = userProfileUpdateSchema.keys({
  department: Joi.string().trim().min(1).max(50).optional(),
  salary: Joi.number().min(0).optional(),
  permissions: Joi.array().items(Joi.string().trim()).optional(),
});

const accountUpdateSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().optional(),
  currentPassword: Joi.string().min(6).when('newPassword', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  newPassword: Joi.string().min(6).optional(),
});

const categoryValidationSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(50),
  description: Joi.string().required().trim().min(1).max(500),
});

const categoryUpdateValidationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).optional(),
  description: Joi.string().trim().min(1).max(500).optional(),
}).min(1);

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userRole = (req as any).user?.role;
  
  let schema;
  
  switch (userRole) {
    case 'customer':
      schema = customerProfileUpdateSchema;
      break;
    case 'manager':
      schema = managerProfileUpdateSchema;
      break;
    case 'admin':
      schema = managerProfileUpdateSchema;
      break;
    default:
      schema = userProfileUpdateSchema;
  }

  const { error } = schema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateAccountUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = accountUpdateSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateCar = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = carValidationSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateCarUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = carUpdateValidationSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = userValidationSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = categoryValidationSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

export const validateCategoryUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = categoryUpdateValidationSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  next();
};

