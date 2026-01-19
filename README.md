# ChatBotrSutra 🤖📊

**ChatBotrSutra** is a powerful "Chat with Data" web application that empowers users to query their MySQL databases using natural language. It leverages Google's advanced **Gemini 2.5 Flash** AI models to translate human questions into SQL queries, execute them, and interpret the results back into plain English.

Designed for seamless integration into business intelligence tools, it features a stunning, responsive React frontend (Vite) and a robust Node.js backend (Vercel Serverless Functions).

---

## ✨ Features

*   **Natural Language Querying**: Ask questions like "What is the total revenue?" or "Show me sales in the North region" without writing a single line of SQL.
*   **Dual-LLM Architecture**:
    *   **LLM #1 (SQL Generator)**: Converts your text into precise, read-only SQL queries (`SELECT` only).
    *   **LLM #2 (Data Analyst)**: Interprets the raw database results and provides a concise, business-friendly summary.
*   **Secure & Safe**: Automatically blocks modification queries (`INSERT`, `UPDATE`, `DELETE`) to protect your data.
*   **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a premium, animated chat experience.
*   **Real-time Feedback**: Visual loading states and error handling.

---

## 🏗️ Tech Stack

### **Frontend**
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### **Backend**
*   **Runtime**: Node.js (Vercel Serverless Functions)
*   **Database Client**: `mysql2`
*   **AI Integration**: Google Generative AI (`gemini-2.5-flash`)
*   **Environment Management**: `dotenv`

### **Database**
*   **System**: MySQL
*   **Database Name**: `sales_db` (default)

---

## 🚀 Step-by-Step Setup Guide

Follow these instructions to get the project running locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js 18+](https://nodejs.org/en/download/)
*   [MySQL Server](https://dev.mysql.com/downloads/installer/)
*   [Vercel CLI](https://vercel.com/docs/cli) (Recommended for local development)
    ```bash
    npm i -g vercel
    ```
*   A Google [Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Database Setup
1.  Open your MySQL client (CLI or Workbench).
2.  Create the database and table:
    ```sql
    CREATE DATABASE IF NOT EXISTS sales_db;
    USE sales_db;

    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE,
      region VARCHAR(50),
      product VARCHAR(50),
      revenue DECIMAL(10, 2)
    );

    -- Insert dummy data
    INSERT INTO sales (date, region, product, revenue) VALUES
    ('2023-01-01', 'North', 'Widget A', 1000.00),
    ('2023-01-02', 'South', 'Widget B', 1500.50),
    ('2023-01-03', 'East', 'Widget A', 800.00),
    ('2023-01-04', 'West', 'Widget C', 2000.00),
    ('2023-01-05', 'North', 'Widget B', 1200.00);
    ```

### 3. Project Setup

1.  **Clone the repository** and navigate to the root directory.

2.  **Install Dependencies**:
    *   Root/Backend dependencies:
        ```bash
        npm install
        ```
    *   Frontend dependencies:
        ```bash
        cd Frontend
        npm install
        cd ..
        ```

3.  **Configure Environment Variables**:
    *   Create a `.env` file in the **root** directory.
    *   Add your configuration:
        ```env
        GEMINI_API_KEY=your_gemini_api_key_here
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_password
        DB_NAME=sales_db
        ```

4.  **Start the Application**:
    Using Vercel CLI (Recommended):
    ```bash
    vercel dev
    ```
    This will start both the backend API (at `/api`) and the frontend (at `/`).
    Open `http://localhost:3000` to view the app.

---

## 🎮 How to Use

1.  Open the web application in your browser.
2.  In the chat input box at the bottom, type a question related to your sales data.
    *   *Example 1*: "What is the total revenue?"
    *   *Example 2*: "List all products sold in the North region."
    *   *Example 3*: "Which region has the highest sales?"
3.  Press **Enter** or click the **Send** button.
4.  Wait a moment for the AI to process your request.

---

## 🔧 Troubleshooting

*   **"Database connection failed"**:
    *   Verify your `.env` credentials in the root directory.
    *   Ensure MySQL server is running.
*   **"Error generating SQL"**:
    *   Check your `GEMINI_API_KEY`.
*   **Backend not found (404 on /chat)**:
    *   Ensure you are running with `vercel dev`. If you run `npm run dev` inside `Frontend`, it will not be able to find the backend API at `http://localhost:5173/chat` without a proxy configuration.

---

## © Copyright

**All rights reserved © ChatBotrSutra**
