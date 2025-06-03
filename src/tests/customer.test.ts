import request from "supertest";
import { Server } from "http";
import { startTestServer, stopTestServer } from "../testServer";
import Car from "../models/Car.model";
import Category from "../models/Category.model";
import Customer from "../models/Customer.model";
import { createTestCustomer, createTestManager } from "./testUtils/authTestUtils";

describe("Customer API", () => {
  let server: Server;
  let port: number;
  let baseURL: string;
  let managerToken: string;
  let customerId: string;
  let carId: string;

  beforeAll(async () => {
    const serverInfo = await startTestServer();
    server = serverInfo.server;
    port = serverInfo.port;
    baseURL = `http://localhost:${port}`;
  });

  beforeEach(async () => {
    const { token } = await createTestManager("customermanager@test.com");
    managerToken = token;

    const { customer } = await createTestCustomer("testcustomer@test.com");
    
    if (!customer) {
      throw new Error("Customer not found after creation");
    }
    customerId = customer._id.toString();

    const category = await Category.create({
      name: "Customer Test Category",
      description: "For customer tests",
    });

    const car = await Car.create({
      brand: "CustomerCar",
      model: "TestModel",
      year: 2023,
      price: 30000,
      color: "Blue",
      mileage: 0,
      fuelType: "electric",
      transmission: "automatic",
      bodyType: "SUV",
      engine: "Electric",
      category: category._id,
      isAvailable: true,
    });

    carId = car._id.toString();
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe("GET /api/customers", () => {
    it("should list customers (manager only)", async () => {
      const response = await request(baseURL)
        .get("/api/customers")
        .set("Authorization", `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user.firstName).toBe("Test");
    });
  });

  describe("POST /api/customers/:id/purchase", () => {
    it("should add car to customer purchase history", async () => {
      const response = await request(baseURL)
        .post(`/api/customers/${customerId}/purchase`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ carId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.purchaseHistory).toHaveLength(1);

      const updatedCustomer = await Customer.findById(customerId).populate(
        "purchaseHistory"
      );

      const firstCar = updatedCustomer?.purchaseHistory[0] as any;
      expect(firstCar.brand).toBe("CustomerCar");
    });
  });

  describe("GET /api/customers/stats", () => {
    it("should get customer statistics", async () => {
      const response = await request(baseURL)
        .get("/api/customers/stats")
        .set("Authorization", `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalCustomers).toBe(1);
    });
  });
});