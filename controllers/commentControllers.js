import prisma from "../configs/prisma.js";

const addComment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, taskId } = req.body;

    // check if user is a member

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    const member = project.members.find((member) => member.userId === userId);
    if (!member) {
      return res
        .status(403)
        .json({ success: false, message: "You are not a member" });
    }

    const comment = await prisma.comment.create({
      data: { taskId, content, userId },
      include: { user: true },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Comment created successfully",
        comment,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
    });

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addComment, getTaskComments };
