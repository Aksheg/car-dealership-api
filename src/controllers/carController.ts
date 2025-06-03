import { Request, Response, NextFunction, RequestHandler } from 'express';
import { CarService } from '../services/carService';
import { ICarFilters } from '../types';
import { createError } from '../middleware/errorHandler';

export const getCars: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      ...filters
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    if (search) {
      const cars = await CarService.searchCars(search as string, limitNum);
      res.json({
        success: true,
        message: 'Search results retrieved successfully',
        data: cars,
        count: cars.length
      });
      return;
    }

    const carFilters: ICarFilters = {};

    if (filters.brand) carFilters.brand = filters.brand as string;
    if (filters.model) carFilters.model = filters.model as string;
    if (filters.minPrice) carFilters.minPrice = parseFloat(filters.minPrice as string);
    if (filters.maxPrice) carFilters.maxPrice = parseFloat(filters.maxPrice as string);
    if (filters.minYear) carFilters.minYear = parseInt(filters.minYear as string);
    if (filters.maxYear) carFilters.maxYear = parseInt(filters.maxYear as string);
    if (filters.minMileage) carFilters.minMileage = parseInt(filters.minMileage as string);
    if (filters.maxMileage) carFilters.maxMileage = parseInt(filters.maxMileage as string);
    if (filters.color) carFilters.color = filters.color as string;
    if (filters.fuelType) carFilters.fuelType = filters.fuelType as string;
    if (filters.transmission) carFilters.transmission = filters.transmission as string;
    if (filters.bodyType) carFilters.bodyType = filters.bodyType as string;
    if (filters.category) carFilters.category = filters.category as string;
    if (filters.isAvailable !== undefined) {
      carFilters.isAvailable = filters.isAvailable === 'true';
    }

    const result = await CarService.getFilteredCars(
      carFilters,
      pageNum,
      limitNum,
      sortBy as string,
      sortOrder as 'asc' | 'desc'
    );

    res.json({
      success: true,
      message: 'Cars retrieved successfully',
      data: result.cars,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getCarById: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const car = await CarService.getCarById(req.params.id);

    if (!car) {
      throw createError('Car not found', 404);
    }

    res.json({
      success: true,
      message: 'Car retrieved successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

export const createCar: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const car = await CarService.createCar(req.body);

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

export const updateCar: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const car = await CarService.updateCar(req.params.id, req.body);

    if (!car) {
      throw createError('Car not found', 404);
    }

    res.json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCar: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const car = await CarService.deleteCar(req.params.id);

    if (!car) {
      throw createError('Car not found', 404);
    }

    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCarStats: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await CarService.getCarStats();

    res.json({
      success: true,
      message: 'Car statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};