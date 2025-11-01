import {Pool} from 'pg'
import {DB_URI} from "../config";


export const pool = new Pool({
    connectionString: DB_URI,
})






