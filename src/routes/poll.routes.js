import express from "express";
import {
  createPollController,
  giveVoteController,
  getPollDetailsController,
  getPollsController,
  getPollResultController,
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

pollRoutes.route("/polls").get(authenticate, getPollsController);

pollRoutes
  .route("/poll-Details/:pollId")
  .get(authenticate, getPollDetailsController);

pollRoutes
  .route("/poll-rusult/:pollId")
  .get(authenticate, getPollResultController);
export default pollRoutes;
