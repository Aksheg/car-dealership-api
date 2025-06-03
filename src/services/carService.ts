import Car from '../models/Car.model';
import { ICarFilters, IPagination } from '../types';
import { FilterQuery } from 'mongoose';

export class CarService {
  static async getFilteredCars(
    filters: ICarFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {

    const query: FilterQuery<any> = {};

    if (filters.brand) {
      query.brand = new RegExp(filters.brand, 'i');
    }

    if (filters.model) {
      query.model = new RegExp(filters.model, 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      query.year = {};
      if (filters.minYear !== undefined) query.year.$gte = filters.minYear;
      if (filters.maxYear !== undefined) query.year.$lte = filters.maxYear;
    }

    if (filters.minMileage !== undefined || filters.maxMileage !== undefined) {
      query.mileage = {};
      if (filters.minMileage !== undefined) query.mileage.$gte = filters.minMileage;
      if (filters.maxMileage !== undefined) query.mileage.$lte = filters.maxMileage;
    }

    if (filters.color) {
      query.color = new RegExp(filters.color, 'i');
    }

    if (filters.fuelType) {
      query.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
      query.transmission = filters.transmission;
    }

    if (filters.bodyType) {
      query.bodyType = new RegExp(filters.bodyType, 'i');
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [cars, total] = await Promise.all([
      Car.find(query)
        .populate('category', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Car.countDocuments(query)
    ]);

    const pagination: IPagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return { cars, pagination };
  }

  static async searchCars(searchTerm: string, limit: number = 10) {
    return Car.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: 'textScore' } }
    )
    .populate('category', 'name description')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
  }

  static async getCarById(id: string) {
    return Car.findById(id).populate('category', 'name description').lean();
  }

  static async createCar(carData: any) {
    const car = new Car(carData);
    return car.save();
  }

  static async updateCar(id: string, updateData: any) {
    return Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('category', 'name description');
  }

  static async deleteCar(id: string) {
    return Car.findByIdAndDelete(id);
  }

  static async getCarStats() {
    const stats = await Car.aggregate([
      {
        $group: {
          _id: null,
          totalCars: { $sum: 1 },
          availableCars: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          averageMileage: { $avg: '$mileage' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCars: 1,
          availableCars: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          averageMileage: { $round: ['$averageMileage', 0] }
        }
      }
    ]);

    const brandStats = await Car.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      overview: stats[0] || {
        totalCars: 0,
        availableCars: 0,
        averagePrice: 0,
        averageMileage: 0
      },
      topBrands: brandStats
    };
  }
}
