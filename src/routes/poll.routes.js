import express from "express";
import {
  createPollController,
  giveVoteController,
  getPollDetailsController,
  getPollsController,
} from "../controllers/poll.controllers.js";
import {
  authenticate,
  isAdmin,
  isUser,
} from "../middlewares/auth.middlewares.js";

const pollRoutes = express.Router();

pollRoutes
  .route("/create-poll")
  .post(authenticate, isAdmin, createPollController);

pollRoutes.route("/vote-now").post(authenticate, isUser, giveVoteController);

pollRoutes.route("/get-polls").get(authenticate, getPollsController);

pollRoutes
  .route("/get-pollDetails/:pollId")
  .get(authenticate, getPollDetailsController);
  
export default pollRoutes;
