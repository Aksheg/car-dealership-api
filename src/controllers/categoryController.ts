import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category.model';
import Car from '../models/Car.model';
import { createError } from '../middleware/errorHandler';

export class CategoryController {
  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find().sort({ name: 1 }).lean();

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findById(req.params.id).lean();
      
      if (!category) {
        throw createError('Category not found', 404);
      }

      const cars = await Car.find({ category: req.params.id })
        .select('brand model year price isAvailable')
        .lean();

      res.json({
        success: true,
        message: 'Category retrieved successfully',
        data: {
          ...category,
          cars,
          carCount: cars.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = new Category(req.body);
      await category.save();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!category) {
        throw createError('Category not found', 404);
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const carCount = await Car.countDocuments({ category: req.params.id });
      
      if (carCount > 0) {
        throw createError('Cannot delete category with existing cars', 400);
      }

      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        throw createError('Category not found', 404);
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}