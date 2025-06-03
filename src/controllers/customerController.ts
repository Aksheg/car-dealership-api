import { Request, Response, NextFunction } from 'express';
import Customer from '../models/Customer.model';
import User from '../models/User.model';
import { createError } from '../middleware/errorHandler';

export class CustomerController {
  static async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        city,
        state,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};
      if (city) {
        filter['address.city'] = new RegExp(city as string, 'i');
      }
      if (state) {
        filter['address.state'] = new RegExp(state as string, 'i');
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [customers, total] = await Promise.all([
        Customer.find(filter)
          .populate('user', '-password')
          .populate('purchaseHistory', 'brand model year price')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Customer.countDocuments(filter)
      ]);

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      };

      res.json({
        success: true,
        message: 'Customers retrieved successfully',
        data: customers,
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await Customer.findById(req.params.id)
        .populate('user', '-password')
        .populate('purchaseHistory', 'brand model year price')
        .lean();
      
      if (!customer) {
        throw createError('Customer not found', 404);
      }

      res.json({
        success: true,
        message: 'Customer retrieved successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { address, drivingLicense, preferredBrands } = req.body;

      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { address, drivingLicense, preferredBrands },
        { new: true, runValidators: true }
      ).populate('user', '-password')
       .populate('purchaseHistory', 'brand model year price');
      
      if (!customer) {
        throw createError('Customer not found', 404);
      }

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await Customer.findById(req.params.id);
      
      if (!customer) {
        throw createError('Customer not found', 404);
      }

      await Promise.all([
        Customer.findByIdAndDelete(req.params.id),
        User.findByIdAndDelete(customer.user)
      ]);

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async addCarToPurchaseHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { carId } = req.body;
      
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { purchaseHistory: carId } },
        { new: true }
      ).populate('user', '-password')
       .populate('purchaseHistory', 'brand model year price');

      if (!customer) {
        throw createError('Customer not found', 404);
      }

      res.json({
        success: true,
        message: 'Car added to purchase history successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            totalPurchases: { $sum: { $size: '$purchaseHistory' } },
            avgPurchasesPerCustomer: { $avg: { $size: '$purchaseHistory' } }
          }
        },
        {
          $project: {
            _id: 0,
            totalCustomers: 1,
            totalPurchases: 1,
            avgPurchasesPerCustomer: { $round: ['$avgPurchasesPerCustomer', 2] }
          }
        }
      ]);

      const locationStats = await Customer.aggregate([
        {
          $group: {
            _id: { state: '$address.state', city: '$address.city' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        success: true,
        message: 'Customer statistics retrieved successfully',
        data: {
          overview: stats[0] || { totalCustomers: 0, totalPurchases: 0, avgPurchasesPerCustomer: 0 },
          topLocations: locationStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}