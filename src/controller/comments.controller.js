import db from "../db/knex.js"

export const createComment = async (req,res,next) => {
    try {
        const {task_id, author_id, content} = req.body;
        console.log(req.body);

        const existing = await db('comments').where('content', content).select('*');
        if (existing.length > 0) {
            return res.status(400).json({ message: "Bu comment allaqachon yaratilgan." });
        }

        const userExists = await db('users').where('id', author_id).first();
        if (!userExists) {
            return res.status(400).json({ message: "Bunday user mavjud emas." });
        }

        const projectExists = await db('tasks').where('id', task_id).first();
        if (!projectExists) {
            return res.status(400).json({ message: "Bunday task_id mavjud emas." });
        }
        
        await db.transaction(async (trx) => {
            const [newComment] = await trx('comments')
                .insert({
                    task_id,
                    author_id,
                    content
                })
                .returning(['id', 'task_id', 'author_id', 'content', 'created_at']);

            res.status(201).json({
                message: "Comment yaratildi.",
                success: true,
                data: newComment
            });
        });
        
    } catch (error) {
        next(error)
        
    }
}