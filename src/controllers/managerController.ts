import { Request, Response, NextFunction } from 'express';
import Manager from '../models/Manager.model';
import User from '../models/User.model';
import { createError } from '../middleware/errorHandler';

export class ManagerController {
  static async getAllManagers(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        department,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};
      if (department) {
        filter.department = new RegExp(department as string, 'i');
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [managers, total] = await Promise.all([
        Manager.find(filter)
          .populate('user', '-password')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Manager.countDocuments(filter)
      ]);

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      };

      res.json({
        success: true,
        message: 'Managers retrieved successfully',
        data: managers,
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getManagerById(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = await Manager.findById(req.params.id)
        .populate('user', '-password')
        .lean();
      
      if (!manager) {
        throw createError('Manager not found', 404);
      }

      res.json({
        success: true,
        message: 'Manager retrieved successfully',
        data: manager
      });
    } catch (error) {
      next(error);
    }
  }

  static async createManager(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        employeeId,
        department,
        salary,
        permissions = []
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError('User already exists with this email', 400);
      }

      const existingManager = await Manager.findOne({ employeeId });
      if (existingManager) {
        throw createError('Employee ID already exists', 400);
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'manager'
      });

      await user.save();

      const manager = new Manager({
        user: user._id,
        employeeId,
        department,
        salary,
        permissions,
        hireDate: new Date()
      });

      await manager.save();

      const populatedManager = await Manager.findById(manager._id)
        .populate('user', '-password');

      res.status(201).json({
        success: true,
        message: 'Manager created successfully',
        data: populatedManager
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateManager(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, department, salary, permissions } = req.body;

      const manager = await Manager.findByIdAndUpdate(
        req.params.id,
        { employeeId, department, salary, permissions },
        { new: true, runValidators: true }
      ).populate('user', '-password');
      
      if (!manager) {
        throw createError('Manager not found', 404);
      }

      res.json({
        success: true,
        message: 'Manager updated successfully',
        data: manager
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteManager(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = await Manager.findById(req.params.id);
      
      if (!manager) {
        throw createError('Manager not found', 404);
      }

      await Promise.all([
        Manager.findByIdAndDelete(req.params.id),
        User.findByIdAndDelete(manager.user)
      ]);

      res.json({
        success: true,
        message: 'Manager deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getManagerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await Manager.aggregate([
        {
          $group: {
            _id: null,
            totalManagers: { $sum: 1 },
            averageSalary: { $avg: '$salary' },
            departmentCount: { $addToSet: '$department' }
          }
        },
        {
          $project: {
            _id: 0,
            totalManagers: 1,
            averageSalary: { $round: ['$averageSalary', 2] },
            totalDepartments: { $size: '$departmentCount' }
          }
        }
      ]);

      const departmentStats = await Manager.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        message: 'Manager statistics retrieved successfully',
        data: {
          overview: stats[0] || { totalManagers: 0, averageSalary: 0, totalDepartments: 0 },
          departmentBreakdown: departmentStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}