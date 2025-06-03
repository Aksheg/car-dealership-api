import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
