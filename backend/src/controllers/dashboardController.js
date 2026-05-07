import { all } from "../config/database.js";

export const getDashboard = async (req, res, next) => {
  try {
    const memberships = all("SELECT projectId, role FROM project_members WHERE userId = ?", [
      req.user.id
    ]);

    const adminProjectIds = memberships
      .filter((membership) => membership.role === "ADMIN")
      .map((membership) => membership.projectId);

    const memberProjectIds = memberships
      .filter((membership) => membership.role === "MEMBER")
      .map((membership) => membership.projectId);

    const orConditions = [];

    if (adminProjectIds.length) {
      orConditions.push({
        projectId: { in: adminProjectIds }
      });
    }

    if (memberProjectIds.length) {
      orConditions.push({
        projectId: { in: memberProjectIds },
        assignedToId: req.user.id
      });
    }

    const tasks = memberships.length
      ? all(
          `
            SELECT *
            FROM tasks
            WHERE
              (${adminProjectIds.length ? `projectId IN (${adminProjectIds.map(() => "?").join(", ")})` : "0"})
              OR
              (${memberProjectIds.length ? `projectId IN (${memberProjectIds.map(() => "?").join(", ")}) AND assignedToId = ?` : "0"})
          `,
          [
            ...adminProjectIds,
            ...memberProjectIds,
            ...(memberProjectIds.length ? [req.user.id] : [])
          ]
        )
      : [];

    const now = new Date();

    const tasksByStatus = tasks.reduce(
      (acc, task) => {
        acc[task.status] += 1;
        return acc;
      },
      {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0
      }
    );

    const overdueTasks = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE"
    );

    res.json({
      totalProjects: memberships.length,
      totalTasks: tasks.length,
      tasksByStatus,
      overdueTasks
    });
  } catch (error) {
    next(error);
  }
};
