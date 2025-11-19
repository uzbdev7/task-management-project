import db from '../db/knex.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date, assigned_to, project_id } = req.body;

    const existing = await db('tasks').where('title', title).select('*');
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bu task allaqachon yaratilgan.' });
    }

    const userExists = await db('users').where('id', assigned_to).first();
    if (!userExists) {
      return res.status(400).json({ message: 'Bunday user mavjud emas.' });
    }

    const projectExists = await db('projects').where('id', project_id).first();
    if (!projectExists) {
      return res.status(400).json({ message: 'Bunday project mavjud emas.' });
    }

    await db.transaction(async (trx) => {
      const [newTask] = await trx('tasks')
        .insert({
          title,
          description,
          status,
          priority,
          due_date,
          assigned_to,
          project_id,
        })
        .returning([
          'id',
          'title',
          'description',
          'priority',
          'status',
          'due_date',
          'assigned_to',
          'project_id',
          'created_at',
        ]);

      res.status(201).json({
        message: 'Task yaratildi.',
        success: true,
        data: newTask,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { search = '', page, limit } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    const query = db('tasks').select(
      'id',
      'title',
      'description',
      'status',
      'priority',
      'due_date',
      'assigned_to',
      'project_id',
      'created_at',
      'updated_at',
    );

    if (search) {
      query.where(function () {
        this.where('title', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
          .orWhere('status', 'ilike', `%${search}%`)
          .orWhere('priority', 'ilike', `${search}`)
          .orWhereRaw('CAST(due_date AS TEXT) ILIKE ?', [`%${search}%`])
          .orWhereRaw('CAST(assigned_to AS TEXT) ILIKE ?', [`%${search}%`])
          .orWhereRaw('CAST(project_id AS TEXT) ILIKE ?', [`%${search}%`]);
      });
    }

    if (role !== 'admin' && role !== 'manager') {
      return res.status(404).json({ message: "Sizda ruxsat yo'q." });
    }

    const totalCountResult = await db('tasks')
      .modify((qb) => {
        if (search) {
          qb.where(function () {
            this.where('title', 'ilike', `%${search}%`)
              .orWhere('description', 'ilike', `%${search}%`)
              .orWhere('status', 'ilike', `%${search}%`)
              .orWhere('priority', 'ilike', `${search}`)
              .orWhereRaw('CAST(due_date AS TEXT) ILIKE ?', [`%${search}%`])
              .orWhereRaw('CAST(assigned_to AS TEXT) ILIKE ?', [`%${search}%`])
              .orWhereRaw('CAST(project_id AS TEXT) ILIKE ?', [`%${search}%`]);
          });
        }

        if (role !== 'admin' && role !== 'manager') {
          return res.status(404).json({ message: "Sizda ruxsat yo'q." });
        }
      })
      .count('id as count')
      .first();

    const totalCount = parseInt(totalCountResult.count);

    const tasks = await query.offset((pageNumber - 1) * pageSize).limit(pageSize);

    return res.status(200).json({
      message: "Loyihalar ro'yxati",
      success: true,
      page: pageNumber,
      limit: pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({
        message: "Ushbu amaliyotni bajarish uchun sizda ruxsat yo'q.Tez borib ruhsat olib keling.",
      });
    }

    const task = await db('tasks')
      .select(
        'id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'assigned_to',
        'project_id',
        'created_at',
        'updated_at',
      )
      .where({ id })
      .first();

    if (!task) {
      return res.status(404).json({ message: 'Siz qidirgan task topilmadi.' });
    }

    res.status(200).json({
      message: "Task ma'lumotlari:",
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to, project_id } = req.body;

    const userExists = await db('users').where('id', assigned_to).first();
    if (!userExists) {
      return res.status(400).json({ message: 'Bunday user mavjud emas.' });
    }

    const projectExists = await db('projects').where('id', project_id).first();
    if (!projectExists) {
      return res.status(400).json({ message: 'Bunday project mavjud emas.' });
    }

    const updated = await db('tasks')
      .where({ id })
      .update({
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
        project_id,
        updated_at: new Date(),
      })
      .returning([
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'assigned_to',
        'project_id',
        'updated_at',
      ]);

    if (!updated.length) {
      return res.status(404).json({ message: 'task topilmadi.' });
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

export const deleteTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await db('tasks')
      .select(
        'id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'assigned_to',
        'project_id',
        'created_at',
        'updated_at',
      )
      .where({ id })
      .first();

    if (!task) {
      return res.status(404).json({ message: 'Task topilmadi.' });
    }

    await db('tasks').where({ id }).del();

    res.status(200).json({
      message: "Muvafaqqiyatli o'chirildi.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const assignUserToTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;
    const { user_id } = req.body;

    const task = await db('tasks').where('id', task_id).first();
    if (!task) return res.status(404).json({ message: 'Task topilmadi.' });

    const user = await db('users').where('id', user_id).first();
    if (!user) return res.status(404).json({ message: 'User topilmadi.' });

    const alreadyAssigned = await db('task_users')
      .where({ task_id: task_id, user_id: user_id })
      .first();

    if (alreadyAssigned)
      return res.status(400).json({ message: 'User allaqachon taskga biriktirilgan.' });

    await db('task_users').insert({
      task_id: task_id,
      user_id: user_id,
      assigned_at: new Date(),
    });

    res.status(200).json({ message: 'User task ga biriktirildi.' });
  } catch (error) {
    next(error);
  }
};

export const getUserTasks = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const userExists = await db('users').where('id', user_id).first();
    if (!userExists) {
      return res.status(404).json({ message: 'User topilmadi.' });
    }

    const tasks = await db('task_users')
      .join('tasks', 'task_users.task_id', 'tasks.id')
      .where('task_users.user_id', user_id)
      .select(
        'tasks.id',
        'tasks.title',
        'tasks.description',
        'tasks.status',
        'tasks.created_at',
        'tasks.updated_at',
        'task_users.assigned_at',
      );

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const unassignUserFromTask = async (req, res, next) => {
  try {
    const { task_id, user_id } = req.params;

    const user = await db('users').where('id', user_id).first();
    if (!user) return res.status(404).json({ message: 'User topilmadi.' });

    const task = await db('tasks').where('id', task_id).first();
    if (!task) return res.status(404).json({ message: 'Task topilmadi.' });

    const deleted = await db('task_users').where({ task_id: task_id, user_id: user_id }).del();

    if (!deleted) return res.status(400).json({ message: 'User ushbu taskga biriktirilmagan.' });

    res.status(200).json({ message: 'User taskdan ajratildi.' });
  } catch (error) {
    next(error);
  }
};
