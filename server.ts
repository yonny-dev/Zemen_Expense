import express from "express"; // Import the Express framework for building web APIs
import { createServer as createViteServer } from "vite"; // Import Vite's development server for HMR and asset serving
import path from "path"; // Import the Node.js path module for handling file paths
import Database from "better-sqlite3"; // Import the better-sqlite3 library for interacting with SQLite databases

const db = new Database("zemen.db"); // Initialize a new SQLite database connection to 'zemen.db'

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for each transaction
    type TEXT NOT NULL, -- Type of transaction: 'income' or 'expense'
    amount REAL NOT NULL, -- Monetary value of the transaction
    category TEXT NOT NULL, -- Category of the transaction (e.g., 'Salary', 'Food')
    source TEXT, -- Payment source type: 'InCash' or 'Digital Money'
    source_name TEXT, -- Specific source name (e.g., 'Telebirr', 'CBE')
    date TEXT NOT NULL, -- Date of the transaction in ISO string format
    description TEXT, -- Optional notes or description for the transaction
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp when the record was created
  );
`); // Execute the SQL command to create the transactions table if it doesn't already exist

async function startServer() { // Define an asynchronous function to initialize and start the server
  const app = express(); // Create an instance of an Express application
  app.use(express.json()); // Enable middleware to parse incoming JSON request bodies
  const PORT = 3000; // Define the port number the server will listen on

  // API Routes
  app.get("/api/transactions", (req, res) => { // Define a GET route to fetch all transactions
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all(); // Query all transactions from the database, ordered by date descending
    res.json(transactions); // Send the list of transactions back to the client as a JSON response
  }); // End of GET /api/transactions

  app.post("/api/transactions", (req, res) => { // Define a POST route to create a new transaction
    const { type, amount, category, source, source_name, date, description } = req.body; // Destructure transaction data from the request body
    const stmt = db.prepare(`
      INSERT INTO transactions (type, amount, category, source, source_name, date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `); // Prepare an SQL statement for inserting a new transaction record
    const info = stmt.run(type, amount, category, source, source_name, date, description); // Execute the insert statement with the provided values
    res.json({ id: info.lastInsertRowid }); // Respond with the ID of the newly created transaction
  }); // End of POST /api/transactions

  app.put("/api/transactions/:id", (req, res) => { // Define a PUT route to update an existing transaction by ID
    const { id } = req.params; // Extract the transaction ID from the URL parameters
    const { type, amount, category, source, source_name, date, description } = req.body; // Destructure updated transaction data from the request body
    const stmt = db.prepare(`
      UPDATE transactions 
      SET type = ?, amount = ?, category = ?, source = ?, source_name = ?, date = ?, description = ?
      WHERE id = ?
    `); // Prepare an SQL statement for updating a transaction record
    stmt.run(type, amount, category, source, source_name, date, description, id); // Execute the update statement with the new values and ID
    res.json({ success: true }); // Respond with a success message
  }); // End of PUT /api/transactions/:id

  app.delete("/api/transactions/:id", (req, res) => { // Define a DELETE route to remove a transaction by ID
    const { id } = req.params; // Extract the transaction ID from the URL parameters
    db.prepare("DELETE FROM transactions WHERE id = ?").run(id); // Prepare and execute an SQL statement to delete the transaction record
    res.json({ success: true }); // Respond with a success message
  }); // End of DELETE /api/transactions/:id

  app.get("/api/stats", (req, res) => { // Define a GET route to fetch transaction statistics
    const stats = db.prepare(`
      SELECT 
        type, 
        SUM(amount) as total 
      FROM transactions 
      GROUP BY type
    `).all(); // Query the database to get the sum of amounts grouped by transaction type (income/expense)
    res.json(stats); // Send the statistics back to the client as a JSON response
  }); // End of GET /api/stats

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") { // Check if the environment is not production
    const vite = await createViteServer({ // Create a Vite development server instance
      server: { middlewareMode: true }, // Configure Vite to run in middleware mode
      appType: "spa", // Specify that the application is a Single Page Application
    }); // End of createViteServer
    app.use(vite.middlewares); // Use Vite's middleware to handle frontend asset serving and HMR
  } else { // If the environment is production
    const distPath = path.join(process.cwd(), "dist"); // Define the path to the production build directory
    app.use(express.static(distPath)); // Serve static files from the 'dist' directory
    app.get("*", (req, res) => { // Define a catch-all route for SPA navigation
      res.sendFile(path.join(distPath, "index.html")); // Send the 'index.html' file for any unknown routes
    }); // End of catch-all route
  } // End of environment check

  app.listen(PORT, "0.0.0.0", () => { // Start the Express server listening on the specified port and host
    console.log(`Zemen Expense Server running on http://localhost:${PORT}`); // Log a message indicating the server is running
  }); // End of app.listen
} // End of startServer function

startServer(); // Call the function to start the server
