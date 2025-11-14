import db from '../db/knex.js'

export const getUser = async (req,res) => {
    try {
        const users = await db('users').select('*')
        res.status(200).json(users)

    }catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Server error" });
    }
}

