import express from "express";
import { createTask, deletTask, updateTask } from "../controllers/taskControllers.js";

const taskRouter = express.Router();

taskRouter.post("/", createTask)
taskRouter.put("/:id", updateTask)
taskRouter.post("/delete", deletTask)

export default taskRouter
