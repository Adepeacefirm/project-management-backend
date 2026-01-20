import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";

const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;

    const origin = req.get("origin");

    // check if user has admin role

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res
        .status(404)
        .json({ sucess: false, message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ sucess: false, message: "Only an admin can do this" });
    } else if (
      assigneeId &&
      !project.members.find((member) => member.user.id === assigneeId)
    ) {
      return res
        .status(403)
        .json({ sucess: false, message: "Assignee is not a member" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId,
        status,
        due_date: new Date(due_date),
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });

    await inngest.send({
      name: "app/task.assigned",
      data: {
        taskId: task.id,
        origin,
      },
    });

    res.status(200).json({
      sucess: true,
      message: "Task created successfully",
      task: taskWithAssignee,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params } });
    if (!task) {
      return res.status(404).json({ sucess: false, message: "Task not found" });
    }
    const { userId } = await req.auth();

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res
        .status(404)
        .json({ sucess: false, message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ sucess: false, message: "Only an admin can do this" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.status(200).json({
      sucess: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

const deletTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { taskIds } = req.body;
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ sucess: false, message: "Tasks not found" });
    }

    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res
        .status(404)
        .json({ sucess: false, message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ sucess: false, message: "Only an admin can do this" });
    }

    await prisma.task.deleteMany({ where: { id: { in: taskIds } } });

    res.status(200).json({
      sucess: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ sucess: false, message: "Server error" });
  }
};

export { createTask, updateTask, deletTask };
