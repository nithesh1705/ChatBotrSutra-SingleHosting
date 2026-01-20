import OpenAI from "openai";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sales_db",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    ssl: {
        rejectUnauthorized: false
    }
};

// Helper: Get DB Connection
async function getDbConnection() {
    try {
        return await mysql.createConnection(dbConfig);
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}

// Helper: Generate SQL
async function generateSql(question) {
    const schemaInfo = `
Table: sales
Columns:
id (integer)
date (date)
region (varchar)
product (varchar)
revenue (decimal)
`;

    const systemPrompt = `You convert user questions into SQL queries for a MySQL database.

Rules:
- Dialect: MySQL.
- Use only the provided schema.
- If question cannot be answered, return exactly: CANNOT_ANSWER.
- Return only raw SQL. No markdown. No explanation.
- For questions about "available" or "list of" distinct values, use SELECT DISTINCT.
- For date extraction, use MySQL functions (e.g., YEAR(date), MONTH(date)).
- In query make sure the value in the columns of region and product the first letter should be in capital and rest following are small cases

Database schema:
${schemaInfo}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            temperature: 0,
        });

        let sql = completion.choices[0].message.content.trim();
        // Clean markdown
        console.log(sql);
        sql = sql.replace(/```sql/g, "").replace(/```/g, "").trim();
        return sql;
    } catch (error) {
        console.error("Error generating SQL:", error);
        return null;
    }
}

// Helper: Generate Natural Answer
async function generateNaturalAnswer(question, sqlResult) {
    const systemPrompt = `You are a business data assistant.

Rules:
- Answer in simple business language.
- Do not mention SQL, database, or code.
- If result is empty, reply: "No data found for this request."
- Keep answers concise.`;

    const userPrompt = `User question:
${question}

Data result:
${JSON.stringify(sqlResult)}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating answer:", error);
        return "Sorry, I encountered an issue generating the answer.";
    }
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'No question provided' });
    }

    try {
        // 1. Generate SQL
        const sqlQuery = await generateSql(question);

        if (!sqlQuery || sqlQuery === "CANNOT_ANSWER") {
            return res.json({ answer: "I cannot answer this question based on the available data." });
        }

        // Safety Check
        const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
        if (forbidden.some(word => sqlQuery.toUpperCase().includes(word))) {
            return res.json({ answer: "Sorry, I cannot execute strictly modification queries." });
        }

        // 2. Execute SQL
        const conn = await getDbConnection();
        const [rows] = await conn.execute(sqlQuery);
        await conn.end();

        // 3. Generate Answer
        let finalAnswer;
        if (!rows || rows.length === 0) {
            finalAnswer = "No data found for this request.";
        } else {
            finalAnswer = await generateNaturalAnswer(question, rows);
        }

        return res.json({ answer: finalAnswer, debug_sql: sqlQuery });

    } catch (error) {
        console.error("Handler error:", error);
        return res.status(500).json({ answer: `Error processing request: ${error.message}` });
    }
}
