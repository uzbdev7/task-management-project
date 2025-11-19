import db from '../db/knex.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const existing = await db('projects').where('name', name).select('*');

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bu project allaqachon yaratilgan.' });
    }

    await db.transaction(async (trx) => {
      const [newProject] = await trx('projects')
        .insert({
          name,
          description,
          status,
        })
        .returning(['id', 'name', 'description', 'status', 'created_at']);

      res.status(201).json({
        message: 'Project yaratildi.',
        success: true,
        data: newProject,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { search = '', page, limit } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    const query = db('projects').select(
      'id',
      'name',
      'description',
      'status',
      'created_at',
      'updated_at',
    );

    if (search) {
      query.where(function () {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
          .orWhere('status', 'ilike', `%${search}%`);
      });
    }

    if (role !== 'admin' && role !== 'manager') {
      return res.status(404).json({ message: "Sizda ruxsat yo'q." });
    }

    const totalCountResult = await db('projects')
      .modify((qb) => {
        if (search) {
          qb.where(function () {
            this.where('name', 'ilike', `%${search}%`)
              .orWhere('description', 'ilike', `%${search}%`)
              .orWhere('status', 'ilike', `%${search}%`);
          });
        }
        if (role !== 'admin' && role !== 'manager') {
          return res.status(404).json({ message: "Sizda ruxsat yo'q." });
        }
      })
      .count('id as count')
      .first();

    const totalCount = parseInt(totalCountResult.count);

    const projects = await query.offset((pageNumber - 1) * pageSize).limit(pageSize);

    return res.status(200).json({
      message: "Loyihalar ro'yxati",
      success: true,
      page: pageNumber,
      limit: pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin' && role !== 'manager') {
      return res.status(403).json({
        message: "Ushbu amaliyotni bajarish uchun sizda ruxsat yo'q.Tez borib ruhsat olib keling.",
      });
    }

    const project = await db('projects')
      .select('id', 'name', 'description', 'status', 'created_at', 'updated_at')
      .where({ id })
      .first();

    if (!project) {
      return res.status(404).json({ message: 'Siz qidirgan Project topilmadi.' });
    }

    res.status(200).json({
      message: "Project ma'lumotlari:",
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updated = await db('projects')
      .where({ id })
      .update({
        name,
        description,
        status,
        updated_at: new Date(),
      })
      .returning(['name', 'description', 'status', 'updated_at']);

    if (!updated.length) {
      return res.status(404).json({ message: 'Project topilmadi.' });
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

export const deleteProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await db('projects')
      .select('id', 'name', 'description', 'status', 'created_at', 'updated_at')
      .where({ id })
      .first();

    if (!project) {
      return res.status(404).json({ message: 'Project topilmadi.' });
    }

    await db('projects').where({ id }).del();

    res.status(200).json({
      message: "Muvafaqqiyatli o'chirildi.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
