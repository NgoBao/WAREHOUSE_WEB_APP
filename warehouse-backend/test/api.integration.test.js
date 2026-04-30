"use strict";

/**
 * Integration tests: in-memory SQLite, real HTTP stack (supertest).
 * Run: npm test
 *
 * Env must be set before the DB module loads.
 */
process.env.NODE_ENV = "test";
process.env.WAREHOUSE_DB_PATH = ":memory:";
process.env.JWT_SECRET = "test_jwt_secret_for_integration_tests_!!";

require("../config/db");

const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { runMigrations } = require("../config/migrations");
const { createAllTablesAsync } = require("../databaseSchema");
const { buildApp } = require("../app");
const { insertMinimalFixtures } = require("./fixtures");

describe("Warehouse API (integration)", () => {
  let app;

  before(async () => {
    await createAllTablesAsync();
    await runMigrations();
    await insertMinimalFixtures();
    app = buildApp();
  });

  test("POST /api/auth/login rejects invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "wrong-password",
    });
    assert.equal(res.status, 401);
    assert.match(res.body?.message || "", /invalid credentials/i);
  });

  test("POST /api/auth/login returns JWT for valid admin", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token, "expected JWT token");
    assert.equal(res.body.user.role, "admin");
  });

  test("GET /api/products without token returns 401", async () => {
    const res = await request(app).get("/api/products");
    assert.equal(res.status, 401);
  });

  test("staff cannot create products (403)", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "staff@test.com",
      password: "password123",
    });
    assert.equal(login.status, 200);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Blocked", price: 10, cost: 5 });

    assert.equal(res.status, 403);
  });

  test("admin can create a product (201)", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "New SKU", price: 12.5, cost: 6.25, sku: "NEW-INT-1" });

    assert.equal(res.status, 201);
    assert.ok(res.body.id);
  });

  test("staff cannot access admin dashboard summary (403)", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "staff@test.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${login.body.token}`);

    assert.equal(res.status, 403);
  });

  test("completing a sale fails when stock is insufficient (400)", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "staff@test.com",
      password: "password123",
    });
    const token = login.body.token;

    const create = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customer_id: 1,
        items: [{ product_id: 1, quantity: 100, price: 10 }],
      });
    assert.equal(create.status, 201, JSON.stringify(create.body));

    const saleId = create.body.id;
    const complete = await request(app)
      .put(`/api/sales/${saleId}/complete`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(complete.status, 400);
    assert.match(complete.body?.message || "", /insufficient stock/i);
  });

  test("receiving a purchase increases on-hand quantity", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    const token = login.body.token;

    const before = await request(app).get("/api/products/1").set("Authorization", `Bearer ${token}`);
    assert.equal(before.status, 200);
    const qtyBefore = before.body.quantity;

    const create = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${token}`)
      .send({
        supplier_id: 1,
        items: [{ product_id: 1, quantity: 3, price: 40 }],
      });
    assert.equal(create.status, 201, JSON.stringify(create.body));
    const poId = create.body.id;

    const recv = await request(app)
      .put(`/api/purchases/${poId}/receive`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(recv.status, 200);

    const after = await request(app).get("/api/products/1").set("Authorization", `Bearer ${token}`);
    assert.equal(after.status, 200);
    assert.equal(after.body.quantity, qtyBefore + 3);
  });
});
