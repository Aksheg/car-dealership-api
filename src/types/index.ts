import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: 'customer' | 'manager' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICar {
  _id: Types.ObjectId;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  mileage: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  bodyType: string;
  engine: string;
  features: string[];
  isAvailable: boolean;
  category: Types.ObjectId;
  images: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomer {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  drivingLicense: string;
  preferredBrands: string[];
  purchaseHistory: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IManager {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  employeeId: string;
  department: string;
  salary: number;
  hireDate: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ICarFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  isAvailable?: boolean;
  category?: string;
  minMileage?: number;
  maxMileage?: number;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<IUser>;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;
}