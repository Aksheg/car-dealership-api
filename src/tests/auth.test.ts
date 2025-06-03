import request from "supertest";
import { Server } from "http";
import { startTestServer, stopTestServer } from "../testServer";
import { createTestUser, createTestCustomer, createTestManager, generateTestToken } from "../tests/testUtils/authTestUtils";

describe("Auth API", () => {
  let server: Server;
  let port: number;
  let baseURL: string;

  beforeAll(async () => {
    const serverInfo = await startTestServer();
    server = serverInfo.server;
    port = serverInfo.port;
    baseURL = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new customer", async () => {
      const response = await request(baseURL)
        .post("/api/auth/register")
        .send({
          email: "customer@test.com",
          password: "password124",
          firstName: "James",
          lastName: "Cole",
          phone: "+1234567891",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe("customer");
    });

    it("should register a new manager with manager role", async () => {
      const response = await request(baseURL)
        .post("/api/auth/register")
        .send({
          email: "manager@test.com",
          password: "password124",
          firstName: "Jasmine",
          lastName: "Hale",
          phone: "+1234567892",
          role: "manager",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe("manager");
    });

    it("should fail with duplicate email", async () => {
      await createTestUser({
        email: "duplicate@test.com",
        password: "password124",
        firstName: "Test",
        lastName: "User",
      });

      const response = await request(baseURL)
        .post("/api/auth/register")
        .send({
          email: "duplicate@test.com",
          password: "password124",
          firstName: "Test",
          lastName: "User",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createTestUser({
        email: "login@test.com",
        password: "password124",
        firstName: "Login",
        lastName: "Test",
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(baseURL)
        .post("/api/auth/login")
        .send({
          email: "login@test.com",
          password: "password124",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("should fail with invalid password", async () => {
      const response = await request(baseURL)
        .post("/api/auth/login")
        .send({
          email: "login@test.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with non-existent email", async () => {
      const response = await request(baseURL)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "password124",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/profile", () => {
    let authToken: string;
    let testUser: any;

    beforeEach(async () => {
      const { user, token } = await createTestCustomer("profile@test.com");
      testUser = user;
      authToken = token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(baseURL)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe("Test");
    });

    it("should fail without token", async () => {
      const response = await request(baseURL)
        .get("/api/auth/profile")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const response = await request(baseURL)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Role-specific tests", () => {
    it("should create manager with proper permissions", async () => {
      const { user, token } = await createTestManager("test-manager@test.com");
      
      expect(user.role).toBe("manager");
      expect(token).toBeDefined();

      const response = await request(baseURL)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user.role).toBe("manager");
    });
  });

  describe("Token generation tests", () => {
    it("should generate valid tokens for existing users", async () => {
      const user = await createTestUser({
        email: "token-test@test.com",
        role: "customer"
      });

      const token = generateTestToken(user._id.toString());
      expect(token).toBeDefined();

      const response = await request(baseURL)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
