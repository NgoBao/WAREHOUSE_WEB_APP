require("dotenv").config();
const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function seed() {

    console.log("Seeding database...");

    const password = await bcrypt.hash("123456", 10);

    db.serialize(() => {

        /* USERS */

        db.run(`INSERT INTO users (name,email,password,role)
      VALUES ('Admin User','admin@test.com','${password}','admin')`);

        for (let i = 1; i <= 3; i++) {
            db.run(`INSERT INTO users (name,email,password,role)
        VALUES ('Staff ${i}','staff${i}@test.com','${password}','staff')`);
        }

        /* SUPPLIERS */

        for (let i = 1; i <= 10; i++) {
            db.run(`
        INSERT INTO suppliers (name,phone,email,address)
        VALUES (
          'Supplier ${i}',
          '40400000${i}',
          'supplier${i}@test.com',
          'Atlanta GA'
        )
      `);
        }

        /* CUSTOMERS */

        for (let i = 1; i <= 10; i++) {
            db.run(`
        INSERT INTO customers (name,phone,email,address)
        VALUES (
          'Customer ${i}',
          '67800000${i}',
          'customer${i}@test.com',
          'Georgia'
        )
      `);
        }

        /* PRODUCTS */

        for (let i = 1; i <= 100; i++) {

            const supplier = (i % 10) + 1;

            db.run(`
        INSERT INTO products
        (name,sku,description,price,cost,quantity,supplier_id)
        VALUES (
          'Product ${i}',
          'SKU${i}',
          'Warehouse product ${i}',
          ${Math.floor(Math.random() * 200) + 20},
          ${Math.floor(Math.random() * 100) + 10},
          ${Math.floor(Math.random() * 50)},
          ${supplier}
        )
      `);
        }

        /* PURCHASE ORDERS */

        for (let i = 1; i <= 250; i++) {

            const supplier = (i % 10) + 1;

            db.run(`
        INSERT INTO purchase_orders
        (supplier_id,total_amount,status)
        VALUES (
          ${supplier},
          ${Math.floor(Math.random() * 5000) + 500},
          'received'
        )
      `);

            const product = (i % 100) + 1;

            db.run(`
        INSERT INTO purchase_items
        (purchase_id,product_id,quantity,price)
        VALUES (
          ${i},
          ${product},
          ${Math.floor(Math.random() * 10) + 1},
          ${Math.floor(Math.random() * 100) + 20}
        )
      `);
        }

        /* SALES ORDERS */

        for (let i = 1; i <= 250; i++) {

            const customer = (i % 10) + 1;

            db.run(`
        INSERT INTO sales_orders
        (customer_id,total_amount,status)
        VALUES (
          ${customer},
          ${Math.floor(Math.random() * 5000) + 500},
          'completed'
        )
      `);

            const product = (i % 100) + 1;

            db.run(`
        INSERT INTO sales_items
        (sales_id,product_id,quantity,price)
        VALUES (
          ${i},
          ${product},
          ${Math.floor(Math.random() * 5) + 1},
          ${Math.floor(Math.random() * 200) + 30}
        )
      `);
        }

    });

    console.log("Database seeded successfully");
}

seed();