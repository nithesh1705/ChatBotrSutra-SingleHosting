import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    console.log("🚀 Starting migration...");

    // 1. Configure Local Connection (SOURCE)
    // EDIT THESE IF YOUR LOCAL DATABASE HAS A PASSWORD
    const localConfig = {
        host: 'localhost',
        user: 'root',
        password: '', // <--- PUT YOUR LOCAL PASSWORD HERE IF YOU HAVE ONE
        database: 'sales_db'
    };

    // 2. Configure Cloud Connection (DESTINATION)
    // These are pulled from your .env file
    const cloudConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    };

    let localConn, cloudConn;

    try {
        // --- Connect to Local ---
        console.log("🔌 Connecting to LOCAL database...");
        try {
            localConn = await mysql.createConnection(localConfig);
            console.log("✅ Connected to Local.");
        } catch (e) {
            throw new Error(`Could not connect to local DB. Check your password in migrate_db.js. Error: ${e.message}`);
        }

        // --- Connect to Cloud ---
        console.log("☁️  Connecting to CLOUD (Aiven) database...");
        cloudConn = await mysql.createConnection(cloudConfig);
        console.log("✅ Connected to Cloud.");

        // --- Read Data ---
        console.log("📖 Reading data from local 'sales' table...");
        const [rows] = await localConn.execute('SELECT * FROM sales');
        console.log(`📊 Found ${rows.length} rows to migrate.`);

        if (rows.length === 0) {
            console.log("⚠️ No data to migrate.");
            return;
        }

        // --- Create Table in Cloud ---
        console.log("🔨 Creating 'sales' table in Cloud if not exists...");
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE,
                region VARCHAR(255),
                product VARCHAR(255),
                revenue DECIMAL(10, 2)
            )
        `;
        await cloudConn.execute(createTableQuery);

        // --- Insert Data ---
        console.log("reshaping data for insertion...");
        // Prepare bulk insert
        const placeHolders = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const values = [];
        rows.forEach(row => {
            // Ensure date is formatted correctly or passed as object
            values.push(row.id, row.date, row.region, row.product, row.revenue);
        });

        const insertQuery = `INSERT INTO sales (id, date, region, product, revenue) VALUES ${placeHolders} 
                             ON DUPLICATE KEY UPDATE revenue=VALUES(revenue), region=VALUES(region), product=VALUES(product)`;

        console.log("🚀 Uploading data to Cloud...");
        await cloudConn.execute(insertQuery, values);

        console.log("🎉 Migration Complete! Your data is now on Aiven.");

    } catch (error) {
        console.error("❌ Migration Failed:", error.message);
    } finally {
        if (localConn) await localConn.end();
        if (cloudConn) await cloudConn.end();
    }
}

migrate();
