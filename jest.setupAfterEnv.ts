import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });
dotenv.config();

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "test-jwt-secret-key-for-testing-only-do-not-use-in-production";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    const MONGODB_TEST_URI =
      process.env.MONGODB_TEST_URI ||
      "mongodb://localhost:27017/car_dealership_test";
    await mongoose.connect(MONGODB_TEST_URI);
    console.log("Connected to test database");
  }
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = mongoose.connection.collections;
    const clearPromises = Object.keys(collections).map((key) =>
      collections[key].deleteMany({})
    );
    await Promise.all(clearPromises);
  }
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});
