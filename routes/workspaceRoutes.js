import express from "express";
import {
  addMemebr,
  getUserWorkspaces,
} from "../controllers/workspaceControllers.js";

const workspaceRouter = express.Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.post("/add-member", addMemebr);

export default workspaceRouter;
