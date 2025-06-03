import request from "supertest";
import mongoose from "mongoose";
import { Server } from "http";
import { startTestServer, stopTestServer } from "../testServer";
import Car from "../models/Car.model";
import Category from "../models/Category.model";
import { createTestManager } from "./testUtils/authTestUtils";

describe("Car API", () => {
  let server: Server;
  let port: number;
  let baseURL: string;
  let authToken: string;
  let categoryId: string;
  let testCarId: string;

  beforeAll(async () => {
    const serverInfo = await startTestServer();
    server = serverInfo.server;
    port = serverInfo.port;
    baseURL = `http://localhost:${port}`;
  });

  beforeEach(async () => {
    const category = new Category({
      name: "Test Category",
      description: "Test category description",
    });
    await category.save();
    categoryId = category._id.toString();

    const { user: managerUser, token } = await createTestManager("carmanager@test.com");
    authToken = token;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe("GET /api/cars", () => {
    it("should get all cars with pagination", async () => {
      const testCars = [
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: true,
        },
      ];

      await Car.insertMany(testCars);

      const response = await request(baseURL).get("/api/cars").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it("should filter cars by brand", async () => {
      const testCars = [
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: true,
        },
      ];

      await Car.insertMany(testCars);

      const response = await request(baseURL)
        .get("/api/cars?brand=Toyota")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].brand).toBe("Toyota");
    });

    it("should filter cars by price range", async () => {
      const testCars = [
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "BMW",
          model: "X5",
          year: 2023,
          price: 60000,
          color: "Blue",
          mileage: 5000,
          fuelType: "hybrid",
          transmission: "automatic",
          bodyType: "SUV",
          engine: "3.0L",
          category: categoryId,
          isAvailable: true,
        },
      ];

      await Car.insertMany(testCars);

      const response = await request(baseURL)
        .get("/api/cars?minPrice=20000&maxPrice=30000")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].price).toBeGreaterThanOrEqual(20000);
      expect(response.body.data[1].price).toBeLessThanOrEqual(30000);
    });

    it("should filter cars by availability", async () => {
      const testCars = [
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: false,
        },
      ];

      await Car.insertMany(testCars);

      const response = await request(baseURL)
        .get("/api/cars?isAvailable=true")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isAvailable).toBe(true);
    });

    it("should search cars by text", async () => {
      const testCars = [
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
          description: "Reliable family sedan",
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: true,
          description: "Sporty compact car",
        },
      ];

      await Car.insertMany(testCars);

      const response = await request(baseURL)
        .get("/api/cars?search=family")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].description).toContain("family");
    });
  });

  describe("GET /api/cars/:id", () => {
    it("should get a single car by ID", async () => {
      const car = await Car.create({
        brand: "Test",
        model: "Car",
        year: 2023,
        price: 30000,
        color: "Red",
        mileage: 0,
        fuelType: "electric",
        transmission: "automatic",
        bodyType: "SUV",
        engine: "Electric",
        category: categoryId,
        isAvailable: true,
      });

      const response = await request(baseURL)
        .get(`/api/cars/${car._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brand).toBe("Test");
      expect(response.body.data._id).toBe(car._id.toString());
    });

    it("should return 404 for non-existent car", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(baseURL)
        .get(`/api/cars/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Car not found");
    });
  });

  describe("POST /api/cars", () => {
    it("should create a new car (manager only)", async () => {
      const newCar = {
        brand: "Tesla",
        model: "Model 3",
        year: 2023,
        price: 45000,
        color: "White",
        mileage: 0,
        fuelType: "electric",
        transmission: "automatic",
        bodyType: "Sedan",
        engine: "Electric",
        category: categoryId,
        isAvailable: true,
        features: ["Autopilot", "Premium Sound System"],
      };

      const response = await request(baseURL)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newCar)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brand).toBe("Tesla");
      expect(response.body.data.features).toHaveLength(2);
      testCarId = response.body.data._id;
    });

    it("should fail without authentication", async () => {
      const response = await request(baseURL)
        .post("/api/cars")
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid data", async () => {
      const invalidCar = {
        brand: "T",
        model: "M",
        year: 1800,
        price: -1000,
      };

      const response = await request(baseURL)
        .post("/api/cars")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidCar)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });

  describe("PUT /api/cars/:id", () => {
    it("should update a car (manager only)", async () => {
      const car = await Car.create({
        brand: "OldBrand",
        model: "OldModel",
        year: 2020,
        price: 20000,
        color: "Black",
        mileage: 30000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "Sedan",
        engine: "2.0L",
        category: categoryId,
        isAvailable: true,
      });

      const updates = {
        brand: "UpdatedBrand",
        price: 25000,
        isAvailable: false,
      };

      const response = await request(baseURL)
        .put(`/api/cars/${car._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brand).toBe("UpdatedBrand");
      expect(response.body.data.price).toBe(25000);
      expect(response.body.data.isAvailable).toBe(false);
    });

    it("should fail to update non-existent car", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(baseURL)
        .put(`/api/cars/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Test" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/cars/:id", () => {
    it("should delete a car (manager only)", async () => {
      const car = await Car.create({
        brand: "ToDelete",
        model: "DeleteMe",
        year: 2023,
        price: 30000,
        color: "Red",
        mileage: 0,
        fuelType: "electric",
        transmission: "automatic",
        bodyType: "SUV",
        engine: "Electric",
        category: categoryId,
        isAvailable: true,
      });

      await request(baseURL)
        .delete(`/api/cars/${car._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      const deletedCar = await Car.findById(car._id);
      expect(deletedCar).toBeNull();
    });
  });

  describe("GET /api/cars/stats", () => {
    it("should get car statistics", async () => {
      await Car.create([
        {
          brand: "Toyota",
          model: "Camry",
          year: 2023,
          price: 25000,
          color: "White",
          mileage: 0,
          fuelType: "gasoline",
          transmission: "automatic",
          bodyType: "Sedan",
          engine: "2.5L",
          category: categoryId,
          isAvailable: true,
        },
        {
          brand: "Honda",
          model: "Civic",
          year: 2022,
          price: 22000,
          color: "Black",
          mileage: 15000,
          fuelType: "gasoline",
          transmission: "manual",
          bodyType: "Sedan",
          engine: "1.5L",
          category: categoryId,
          isAvailable: false,
        },
      ]);

      const response = await request(baseURL)
        .get("/api/cars/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalCars).toBe(2);
      expect(response.body.data.overview.availableCars).toBe(1);
      expect(response.body.data.topBrands).toHaveLength(2);
    });
  });
});