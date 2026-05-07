import { all, get, run } from "../config/database.js";
import httpError from "../utils/httpError.js";

const mapTaskRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  dueDate: row.dueDate,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  projectId: row.projectId,
  assignedToId: row.assignedToId,
  createdById: row.createdById,
  assignedTo: row.assignedToUserId
    ? {
        id: row.assignedToUserId,
        name: row.assignedToName,
        email: row.assignedToEmail
      }
    : null,
  createdBy: {
    id: row.createdByUserId,
    name: row.createdByName,
    email: row.createdByEmail
  }
});

export const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId);

    const tasks = all(
      `
        SELECT
          t.*,
          assigned.id AS assignedToUserId,
          assigned.name AS assignedToName,
          assigned.email AS assignedToEmail,
          creator.id AS createdByUserId,
          creator.name AS createdByName,
          creator.email AS createdByEmail
        FROM tasks t
        LEFT JOIN users assigned ON assigned.id = t.assignedToId
        JOIN users creator ON creator.id = t.createdById
        WHERE t.projectId = ?
          AND (? != 'MEMBER' OR t.assignedToId = ?)
        ORDER BY t.createdAt DESC
      `,
      [projectId, req.projectMembership.role, req.user.id]
    ).map(mapTaskRow);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedToId, dueDate, status } = req.body;

    if (!title || !projectId) {
      return next(httpError("Title and projectId are required", 400));
    }

    if (assignedToId) {
      const membership = get(
        "SELECT id FROM project_members WHERE projectId = ? AND userId = ?",
        [Number(projectId), Number(assignedToId)]
      );

      if (!membership) {
        return next(httpError("Assigned user must be a member of the project", 400));
      }
    }

    const result = run(
      `
        INSERT INTO tasks (title, description, projectId, assignedToId, dueDate, status, createdById)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description ?? null,
        Number(projectId),
        assignedToId ? Number(assignedToId) : null,
        dueDate ? new Date(dueDate).toISOString() : null,
        status || "TODO",
        req.user.id
      ]
    );

    const task = all(
      `
        SELECT
          t.*,
          assigned.id AS assignedToUserId,
          assigned.name AS assignedToName,
          assigned.email AS assignedToEmail,
          creator.id AS createdByUserId,
          creator.name AS createdByName,
          creator.email AS createdByEmail
        FROM tasks t
        LEFT JOIN users assigned ON assigned.id = t.assignedToId
        JOIN users creator ON creator.id = t.createdById
        WHERE t.id = ?
      `,
      [Number(result.lastInsertRowid)]
    ).map(mapTaskRow)[0];

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const { title, description, status, assignedToId, dueDate } = req.body;

    const existingTask = get("SELECT * FROM tasks WHERE id = ?", [taskId]);

    if (!existingTask) {
      return next(httpError("Task not found", 404));
    }

    const membership = get(
      "SELECT * FROM project_members WHERE projectId = ? AND userId = ?",
      [existingTask.projectId, req.user.id]
    );

    if (!membership) {
      return next(httpError("You do not have access to this task", 403));
    }

    const isAdmin = membership.role === "ADMIN";
    const isAssignedMember = existingTask.assignedToId === req.user.id;

    if (!isAdmin && !isAssignedMember) {
      return next(httpError("You can only update tasks assigned to you", 403));
    }

    const updateData = isAdmin
      ? {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(assignedToId !== undefined
            ? { assignedToId: assignedToId ? Number(assignedToId) : null }
            : {}),
          ...(dueDate !== undefined
            ? { dueDate: dueDate ? new Date(dueDate).toISOString() : null }
            : {})
        }
      : {
          ...(status !== undefined ? { status } : {})
        };

    if (isAdmin && assignedToId) {
      const assigneeMembership = get(
        "SELECT id FROM project_members WHERE projectId = ? AND userId = ?",
        [existingTask.projectId, Number(assignedToId)]
      );

      if (!assigneeMembership) {
        return next(httpError("Assigned user must be a project member", 400));
      }
    }

    const columns = Object.entries(updateData);

    if (columns.length) {
      const assignments = columns.map(([key]) => `${key} = ?`).join(", ");
      const values = columns.map(([, value]) => value);

      run(`UPDATE tasks SET ${assignments}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [
        ...values,
        taskId
      ]);
    }

    const updatedTask = all(
      `
        SELECT
          t.*,
          assigned.id AS assignedToUserId,
          assigned.name AS assignedToName,
          assigned.email AS assignedToEmail,
          creator.id AS createdByUserId,
          creator.name AS createdByName,
          creator.email AS createdByEmail
        FROM tasks t
        LEFT JOIN users assigned ON assigned.id = t.assignedToId
        JOIN users creator ON creator.id = t.createdById
        WHERE t.id = ?
      `,
      [taskId]
    ).map(mapTaskRow)[0];

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};
