import express from "express";
import {
  addMemeber,
  createProject,
  updateProject,
} from "../controllers/projectControllers.js";

const projectRouter = express.Router();

projectRouter.post("/", createProject);
projectRouter.put("/", updateProject);
projectRouter.post("/:projectId/add-member", addMemeber);

export default projectRouter;
