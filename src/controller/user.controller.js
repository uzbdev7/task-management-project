import db from '../db/knex.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user; 
    const { search = "", page, limit } = req.query;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 10, 1);

    const query = db("users").select(
      "id",
      "email",
      "username",
      "role",
      "status",
      "created_at",
      "updated_at"
    );

    if (search) {
      query.where(function () {
        this.where("username", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`)
          .orWhere("role", "ilike", `%${search}%`);
      });
    }

    if (role !== "admin" && role !== "manager") {
      query.andWhere({ id: userId });
    }

    const totalCountResult = await db("users")
      .modify((qb) => {
        if (search) {
          qb.where(function () {
            this.where("username", "ilike", `%${search}%`)
              .orWhere("email", "ilike", `%${search}%`)
              .orWhere("role", "ilike", `%${search}%`);
          });
        }
        if (role !== "admin" && role !== "manager") {
          qb.andWhere({ id: userId });
        }
      })
      .count("id as count")
      .first();

    const totalCount = parseInt(totalCountResult.count);

    const users = await query
      .offset((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      message: "Foydalanuvchilar ro'yxati",
      success: true,
      page: pageNumber,
      limit: pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      users,
    });

  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;       
    const { role, id: userId } = req.user; 

    if (role !== 'admin' && userId !== id) {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const user = await db('users')
      .select('id', 'email', 'username', 'role', 'status', 'created_at', 'updated_at')
      .where({ id })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User topilmadi!' });
    }

    res.status(200).json({
      message: "User ma'lumotlari",
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {username, role} = req.body;

    const updated = await db('users')
    .where({id})
    .update({
      username,
      role,
      updated_at: new Date()
    })
    .returning(['username', 'role'])
    
    if(!updated.length){
      res.status( 404).json({message:"User topilmadi."})
    }

    res.status(200).json({
      message:"Muvafaqqiyatli yangilandi.",
      success:true,
      date: updated[0]
    })

  } catch (error) {
    next(error)
  }
}

export const deleteUserById = async (req,res,next) => {
  try {
    const { id } = req.params;
    const user = await db('users')
    .select('id', 'email', 'username', 'role', 'status', 'created_at', 'updated_at')
    .where({id})
    .first();

    if(!user){
     return res.status(404).json({message:"User topilmadi."})
    }

    const deleted = await db('users')
    .where({id})
    .del();

    res.status(200).json({
      message:"Muvafaqqiyatli o'chirildi.",
      success:true,
      data: deleted
    })

  } catch (error) {
    next(error)
  }
}

