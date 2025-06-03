import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import Customer from "../models/Customer.model";
import Manager from "../models/Manager.model";
import { createError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = "customer",
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError("User already exists with this email", 400);
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
      });

      await user.save();

      if (role === "customer") {
        const customer = new Customer({
          user: user._id,
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          drivingLicense: "",
          preferredBrands: [],
          purchaseHistory: [],
        });
        await customer.save();
      } else if (role === "manager") {
        const manager = new Manager({
          user: user._id,
          employeeId: `EMP${Date.now()}`,
          department: "General",
          salary: 0,
          hireDate: new Date(),
          permissions: [],
        });
        await manager.save();
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError("Email and password are required", 400);
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw createError("Invalid credentials", 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw createError("Invalid credentials", 401);
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let profile = null;

      if (req.user?.role === "customer") {
        profile = await Customer.findOne({ user: req.user._id })
          .populate("user", "-password")
          .populate("purchaseHistory", "brand model year price");
      } else if (req.user?.role === "manager") {
        profile = await Manager.findOne({ user: req.user._id }).populate(
          "user",
          "-password"
        );
      }

      res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile || req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        firstName,
        lastName,
        phone,
        address,
        preferredBrands,
        drivingLicense,
        department,
        salary,
        permissions,
      } = req.body;

      const userUpdateData: any = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      if (phone !== undefined) userUpdateData.phone = phone;

      let updatedUser = null;
      if (Object.keys(userUpdateData).length > 0) {
        updatedUser = await User.findByIdAndUpdate(
          req.user?._id,
          userUpdateData,
          { new: true, runValidators: true }
        );
      }

      let updatedProfile = null;
      if (req.user?.role === "customer") {
        const customerUpdateData: any = {};
        if (address !== undefined) customerUpdateData.address = address;
        if (preferredBrands !== undefined)
          customerUpdateData.preferredBrands = preferredBrands;
        if (drivingLicense !== undefined)
          customerUpdateData.drivingLicense = drivingLicense;

        if (Object.keys(customerUpdateData).length > 0) {
          updatedProfile = await Customer.findOneAndUpdate(
            { user: req.user._id },
            customerUpdateData,
            { new: true, runValidators: true }
          ).populate("user", "-password");
        }
      } else if (req.user?.role === "manager") {
        const managerUpdateData: any = {};
        if (department !== undefined) managerUpdateData.department = department;
        if (salary !== undefined) managerUpdateData.salary = salary;
        if (permissions !== undefined)
          managerUpdateData.permissions = permissions;

        if (Object.keys(managerUpdateData).length > 0) {
          updatedProfile = await Manager.findOneAndUpdate(
            { user: req.user._id },
            managerUpdateData,
            { new: true, runValidators: true }
          ).populate("user", "-password");
        }
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile || updatedUser || req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
