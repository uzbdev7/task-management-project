import db from '../db/knex.js';

export const createComment = async (req, res, next) => {
  try {
    const { task_id, author_id, content } = req.body;
    console.log(req.body);

    const existing = await db('comments').where('content', content).select('*');
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bu comment allaqachon yaratilgan.' });
    }

    const userExists = await db('users').where('id', author_id).first();
    if (!userExists) {
      return res.status(400).json({ message: 'Bunday user mavjud emas.' });
    }

    const projectExists = await db('tasks').where('id', task_id).first();
    if (!projectExists) {
      return res.status(400).json({ message: 'Bunday task_id mavjud emas.' });
    }

    await db.transaction(async (trx) => {
      const [newComment] = await trx('comments')
        .insert({
          task_id,
          author_id,
          content,
        })
        .returning(['id', 'task_id', 'author_id', 'content', 'created_at']);

      res.status(201).json({
        message: 'Comment yaratildi.',
        success: true,
        data: newComment,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { search = '', page, limit } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    const query = db('comments').select(
      'id',
      'content',
      'task_id',
      'author_id',
      'created_at',
      'updated_at',
    );

    if (search) {
      query.where(function () {
        this.where('content', 'ilike', `%${search}%`)
          .orWhereRaw('CAST(task_id AS TEXT) ILIKE ?', [`%${search}%`])
          .orWhereRaw('CAST(author_id AS TEXT) ILIKE ?', [`%${search}%`]);
      });
    }

    const totalCountResult = await db('comments')
      .modify((qb) => {
        if (search) {
          qb.where(function () {
            this.where('content', 'ilike', `%${search}%`)
              .orWhereRaw('CAST(task_id AS TEXT) ILIKE ?', [`%${search}%`])
              .orWhereRaw('CAST(author_id AS TEXT) ILIKE ?', [`%${search}%`]);
          });
        }
      })
      .count('id as count')
      .first();

    const totalCount = parseInt(totalCountResult.count);

    const comments = await query.offset((pageNumber - 1) * pageSize).limit(pageSize);

    return res.status(200).json({
      message: "Kommentariyalar ro'yxati",
      success: true,
      page: pageNumber,
      limit: pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      comments,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await db('comments')
      .select('id', 'content', 'task_id', 'author_id', 'created_at', 'updated_at')
      .where({ id })
      .first();

    if (!comment) {
      return res.status(404).json({ message: 'Siz qidirgan comment topilmadi.' });
    }

    res.status(200).json({
      message: "comment ma'lumotlari:",
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, task_id, author_id } = req.body;

    if (author_id) {
      const userExists = await db('users').where('id', author_id).first();
      if (!userExists) {
        return res.status(400).json({ message: 'Bunday user mavjud emas.' });
      }
    }

    if (task_id) {
      const taskExists = await db('tasks').where('id', task_id).first();
      if (!taskExists) {
        return res.status(400).json({ message: 'Bunday task mavjud emas.' });
      }
    }

    const updated = await db('comments')
      .where({ id })
      .update({
        content,
        task_id,
        author_id,
        updated_at: new Date(),
      })
      .returning(['content', 'author_id', 'task_id', 'updated_at']);

    if (!updated.length) {
      return res.status(404).json({ message: 'comment topilmadi.' });
    }

    res.status(200).json({
      message: 'Muvafaqqiyatli yangilandi.',
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await db('comments')
      .select('id', 'content', 'author_id', 'task_id', 'created_at', 'updated_at')
      .where({ id })
      .first();

    if (!comment) {
      return res.status(404).json({ message: 'Task topilmadi.' });
    }

    await db('comments').where({ id }).del();

    res.status(200).json({
      message: "Muvafaqqiyatli o'chirildi.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
