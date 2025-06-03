import mongoose, { Schema, Model } from "mongoose";
import { ICustomer } from "../types";

const customerSchema = new Schema<ICustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      zipCode: { type: String, required: false },
      country: { type: String, required: false },
    },
    drivingLicense: { type: String, required: false },
    preferredBrands: [
      {
        type: String,
        trim: true,
      },
    ],
    purchaseHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Car",
      },
    ],
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ "address.city": 1, "address.state": 1 });

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);
export default Customer;
