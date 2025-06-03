import mongoose, { Schema, Model } from 'mongoose';
import { IManager } from '../types';

const managerSchema = new Schema<IManager>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  permissions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const Manager: Model<IManager> = mongoose.model<IManager>('Manager', managerSchema);
export default Manager;
