import request from "supertest";
import { Server } from "http";
import { startTestServer, stopTestServer } from "../testServer";
import {
  createTestManager,
  createTestAdmin,
} from "../tests/testUtils/authTestUtils";

describe("Manager API", () => {
  let server: Server;
  let port: number;
  let baseURL: string;
  let adminToken: string;

  beforeAll(async () => {
    const serverInfo = await startTestServer();
    server = serverInfo.server;
    port = serverInfo.port;
    baseURL = `http://localhost:${port}`;
  });

  beforeEach(async () => {
    const { token } = await createTestAdmin();
    adminToken = token;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe("POST /api/managers", () => {
    it("should create a new manager (admin only)", async () => {
      const response = await request(baseURL)
        .post("/api/managers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "newmanager@test.com",
          password: "password123",
          firstName: "New",
          lastName: "Manager",
          employeeId: "EMP123",
          department: "Sales",
          salary: 50000,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("manager");
      expect(response.body.data.employeeId).toBe("EMP123");
    });

    it("should fail with duplicate employee ID", async () => {
      await request(baseURL)
        .post("/api/managers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "manager1@test.com",
          password: "password123",
          firstName: "Manager",
          lastName: "One",
          employeeId: "EMP111",
          department: "Sales",
          salary: 50000,
        });

      const response = await request(baseURL)
        .post("/api/managers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "manager2@test.com",
          password: "password123",
          firstName: "Manager",
          lastName: "Two",
          employeeId: "EMP111",
          department: "Sales",
          salary: 50000,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/managers", () => {
    it("should list all managers (admin only)", async () => {
      await createTestManager("listmanager@test.com");

      const response = await request(baseURL)
        .get("/api/managers")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].employeeId).toBeDefined();
    });

    it("should filter managers by department", async () => {
      await createTestManager("financemanager@test.com");

      const response = await request(baseURL)
        .get("/api/managers?department=Finance")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("DELETE /api/managers/:id", () => {
    it("should delete a manager (admin only)", async () => {
      const { user, manager } = await createTestManager("deleteme@test.com");

      if (!manager) {
        throw new Error("Manager not created properly");
      }

      const response = await request(baseURL)
        .delete(`/api/managers/${manager._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});