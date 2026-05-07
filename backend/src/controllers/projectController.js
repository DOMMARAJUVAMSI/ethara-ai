import { all, get, run, transaction } from "../config/database.js";
import httpError from "../utils/httpError.js";

export const getProjects = async (req, res, next) => {
  try {
    const memberships = all(
      `
        SELECT
          pm.projectId,
          pm.role,
          p.name,
          p.description,
          p.createdAt,
          p.updatedAt,
          o.id AS ownerId,
          o.name AS ownerName,
          o.email AS ownerEmail
        FROM project_members pm
        JOIN projects p ON p.id = pm.projectId
        JOIN users o ON o.id = p.ownerId
        WHERE pm.userId = ?
        ORDER BY p.createdAt DESC
      `,
      [req.user.id]
    );

    const formattedProjects = memberships.map((membership) => {
      const members = all(
        `
          SELECT
            pm.id,
            pm.role,
            u.id AS userId,
            u.name AS userName,
            u.email AS userEmail
          FROM project_members pm
          JOIN users u ON u.id = pm.userId
          WHERE pm.projectId = ?
          ORDER BY pm.id ASC
        `,
        [membership.projectId]
      );

      const taskCount = get("SELECT COUNT(*) AS count FROM tasks WHERE projectId = ?", [
        membership.projectId
      ]);

      return {
        id: membership.projectId,
        name: membership.name,
        description: membership.description,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
        owner: {
          id: membership.ownerId,
          name: membership.ownerName,
          email: membership.ownerEmail
        },
        currentUserRole: membership.role,
        members: members.map((member) => ({
          id: member.id,
          role: member.role,
          user: {
            id: member.userId,
            name: member.userName,
            email: member.userEmail
          }
        })),
        tasksCount: taskCount.count
      };
    });

    res.json(formattedProjects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(httpError("Project name is required", 400));
    }

    const project = transaction(() => {
      const projectResult = run(
        "INSERT INTO projects (name, description, ownerId) VALUES (?, ?, ?)",
        [name, description ?? null, req.user.id]
      );

      const projectId = Number(projectResult.lastInsertRowid);

      run("INSERT INTO project_members (projectId, userId, role) VALUES (?, ?, ?)", [
        projectId,
        req.user.id,
        "ADMIN"
      ]);

      return get("SELECT * FROM projects WHERE id = ?", [projectId]);
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { email, role = "MEMBER" } = req.body;

    if (!email) {
      return next(httpError("Member email is required", 400));
    }

    const user = get("SELECT id, name, email FROM users WHERE email = ?", [email]);

    if (!user) {
      return next(httpError("User not found with this email", 404));
    }

    const existingMembership = get(
      "SELECT id FROM project_members WHERE projectId = ? AND userId = ?",
      [projectId, user.id]
    );

    if (existingMembership) {
      return next(httpError("User is already a member of this project", 409));
    }

    const result = run("INSERT INTO project_members (projectId, userId, role) VALUES (?, ?, ?)", [
      projectId,
      user.id,
      role
    ]);

    const member = {
      id: Number(result.lastInsertRowid),
      projectId,
      userId: user.id,
      role,
      user
    };

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};
