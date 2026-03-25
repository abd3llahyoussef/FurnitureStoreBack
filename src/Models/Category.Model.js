import { client } from "../client.js";

export class CategoryModel{
    async createCategory({categoryname,description}){
        const conn = await client.connect();
        try{
            const sql = `INSERT INTO Category (categoryname,description) VALUES ($1,$2) RETURNING *`;
            const result = await conn.query(sql,[categoryname,description]);
            return result.rows[0];
        }catch(err){
            throw new Error(`Could not create category ${categoryname}. Error: ${err}`);
        }finally{
            conn.release();
        }
    }

    async getCategories(){
        const conn = await client.connect();
        try{
            const sql = `SELECT * FROM Category`;
            const result = await conn.query(sql);
            return result.rows;
        }catch(err){
            throw new Error(`Could not get categories. Error: ${err}`);
        }finally{
            conn.release();
        }
    }

    async getCategory({categoryid}){
        const conn = await client.connect();
        try{
            const sql = `SELECT * FROM Category WHERE categoryid=$1`;
            const result = await conn.query(sql,[categoryid]);
            return result.rows[0];
        }catch(err){
            throw new Error(`Could not get category ${categoryid}. Error: ${err}`);
        }finally{
            conn.release();
        }
    }

    async updateCategory({categoryid,categoryname,description}){
        const conn = await client.connect();
        try{
            const sql = `UPDATE Category SET categoryname=$1,description=$2 WHERE categoryid=$3 RETURNING *`;
            const result = await conn.query(sql,[categoryname,description,categoryid]);
            return result.rows[0];
        }catch(err){
            throw new Error(`Could not update category ${categoryname}. Error: ${err}`);
        }finally{
            conn.release();
        }
    }

    async deleteCategory({categoryid}){
        const conn = await client.connect();    
        try{
            const sql = `DELETE FROM Category WHERE categoryid=$1 RETURNING *`;
            const result = await conn.query(sql,[categoryid]);
            return result.rows[0];
        }catch(err){
            throw new Error(`Could not delete category ${categoryid}. Error: ${err}`);
        }finally{
            conn.release();
        }
    }
}


