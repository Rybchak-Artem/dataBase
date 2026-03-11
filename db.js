import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg;
const pool = new Pool({
   connectionString: `${process.env.DB_URL}`,
   ssl: {
      rejectUnauthorized: false
   }
});
const initializeDatabase = async () => {
   console.log('Initializing data database...');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users_test (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,      
    password TEXT NOT NULL,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
   `;

   try {
      const client = await pool.connect();
      await pool.query(createTableQuery);
      console.log('---The server is ready to go.---');
   } catch (error) {
      console.error('Error initializing database:', error.message);
      console.error('Full error:', error);
      throw error;
   }
};
await initializeDatabase();

async function addEmail(email, password) {
    const query = `
        INSERT INTO users_test (
            email,
            password
        ) 
        VALUES ($1, $2) 
        RETURNING *`;

    const values = [email, password];
   
    try {
       const res = await pool.query(query, values);
       console.log('user додано:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err.message);
    }
}


async function allUsers() {
    const res = await pool.query('SELECT * FROM users_test');
    
    console.table(res.rows)
    return res.rows
}


async function deleteUser(id) {
    const query = `
        DELETE FROM users_test 
        WHERE id = $1
        RETURNING *`;
    const values = [id];

     try {
    const res = await pool.query(query, values);
    
    if (res.rows.length > 0) {
        console.log(`User with id:${id} deleted:`, res.rows[0]);
    } else {
        console.log(`User with id:${id} not found`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}




(async () => {
   try {

      switch(process.argv[2]) { 
        
        case 'list': {
            await allUsers();
            break;
        } 

        case 'add': {
            await addEmail(process.argv[3], process.argv[4]);
            break;
        }
        
        case 'delete': {
            const id = parseInt(process.argv[3]);
            await deleteUser(id);
            break;
        }
        
        case "help": {
            console.log("All comands:");
            console.log("node db.js list - show all Users");
            console.log("node db.js add (email) (password)");
            console.log("node db.js delete (id)");
            break;
        }
      }

   }


    catch (err) {
      console.error("Error:", err.message);
   } finally {
      console.log('---The database has finished working.---');
}
})();

