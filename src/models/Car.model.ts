import mongoose, { Schema, Model } from 'mongoose';
import { ICar } from '../types';

const carSchema = new Schema<ICar>({
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  model: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  mileage: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    required: true,
    index: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true,
    index: true
  },
  bodyType: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  engine: {
    type: String,
    required: true,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  images: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1, isAvailable: 1 });
carSchema.index({ year: 1, mileage: 1 });
carSchema.index({ fuelType: 1, transmission: 1 });
carSchema.index({ category: 1, isAvailable: 1 });

carSchema.index({
  brand: 'text',
  model: 'text',
  description: 'text',
  features: 'text'
});

const Car: Model<ICar> = mongoose.model<ICar>('Car', carSchema);
export default Car;
