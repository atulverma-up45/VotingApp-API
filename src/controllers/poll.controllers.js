import Vote from "../models/vote.models.js";
import Poll from "../models/poll.models.js";
import User from "../models/user.models.js";
import sendMail from "../utils/sendMail.js";
import newPollCreatedTemplate from "../mail/templates/newPollCreated.mailTemplates.js";

export const createPollController = async (req, res) => {
  try {
    // Take input from req body
    const { question, options } = req.body;
    const createdBy = req.user.id;

    // Validate the input
    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Question and at least two options are required to create a poll",
      });
    }

    // Create poll
    const createdPoll = new Poll({
      question,
      options,
      createdBy,
    });

    // Save in DataBase
    const savedPoll = await createdPoll.save();

    // Inform the user of the new poll creation
    const usersToNotify = await User.find();

    if (usersToNotify.length === 0) {
      console.log("No users to notify about the new poll.");
    } else {
      for (const user of usersToNotify) {
        try {
          await sendMail(
            user.email,
            "New Poll Created Notification Mail from VotingApp API",
            newPollCreatedTemplate(user.firstName, question)
          );
        } catch (emailError) {
          console.error(
            `Error sending email to ${user.email}:`,
            emailError.message
          );
        }
      }
    }

    // Return Response
    return res.status(201).json({
      success: true,
      message: "The poll is created successfully",
      data: savedPoll,
    });
  } catch (error) {
    console.error("Error occurred while creating the poll:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error - The poll is not created",
    });
  }
};

export const giveVoteController = async (req, res) => {
  try {
    // Fetch the input from req
    const { pollId, selectedOption } = req.body;
    const userId = req.user._id;

    // Validate the user data
    if (!pollId || !selectedOption) {
      return res.status(400).json({
        success: false,
        message: "Poll ID and Selected Option are required for giving the vote",
      });
    }

    // Check User's Previous Votes
    const previousVote = await Vote.findOne({ user: userId, poll: pollId });

    if (previousVote) {
      return res.status(400).json({
        success: false,
        message: "The user has already given a vote for this poll",
      });
    }

    // Fetch the poll document
    const pollDocument = await Poll.findById(pollId);

    // Check if the selected option is valid
    if (!(pollDocument && pollDocument.options.includes(selectedOption))) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid selected option. Please choose a valid option for the poll.",
      });
    }

    // Create Vote Object
    const newVote = new Vote({
      user: userId,
      poll: pollId,
      selectedOption,
    });

    // Save Vote in the Database
    await newVote.save();

    // Return Response
    return res.status(201).json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (error) {
    console.error("Error occurred while giving the vote:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export const getPollsController = async (req, res) => {
  try {
    // Fetch all polls from the database
    const polls = await Poll.find().select(
      "-createdBy -createdAt -updatedAt -__v"
    );

    // Check if there are no polls available (empty list)
    if (polls.length === 0) {
      return res.status(200).json({
        success: true,
        message: "There are no polls created",
        data: polls,
      });
    }

    // Return polls if available
    return res.status(200).json({
      success: true,
      message: "Polls retrieved successfully",
      data: polls,
    });
  } catch (error) {
    console.error("Error occurred while retrieving the polls:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error while retrieving the polls",
    });
  }
};

export const getPollDetailsController = async (req, res) => {
  try {
    // Fetch Poll ID from Request Parameters:
    const pollId = req.params.pollId;

    // Validate Poll ID:
    if (!pollId) {
      return res.status(400).json({
        success: false,
        message: "pollId is Required for fetching the Poll Details",
      });
    }

    // Fetch Poll Details from Database:
    const pollDetails = await Poll.findById(pollId)
      .populate({
        path: "createdBy",
        select: "firstName lastName",
      })
      .exec();

    // Check Poll Existence:
    if (!pollDetails) {
      return res.status(404).json({
        success: false,
        message: "Poll not found with the provided pollId",
      });
    }

    // Return Poll Details:
    return res.status(200).json({
      success: true,
      message: "Poll Details Fetched Successfully",
      data: pollDetails,
    });
  } catch (error) {
    console.log(
      "Error Occurred While Fetching the Poll Details in getPollDetailsController :",
      error
    );
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error - Error Occurred While Fetching the Poll Details",
    });
  }
};

export const deletePollController = async (req, res) => {
  try {
    // fetch the poll id for req params
    const pollId = req.params.pollId;

    // validate the poll id
    if (!pollId) {
      return res.status(400).json({
        success: false,
        message: "Poll Id is Required for Deleting the Poll",
      });
    }

    // fetch the existing poll using poll id
    const existingPoll = await Poll.findById(pollId);

    // check the poll exist or not
    if (!existingPoll) {
      return res.status(404).json({
        success: false,
        message:
          "Poll is Not Exist With the PollId please enter a valid poll id",
      });
    }

    // Delete all votes associated with the poll
    await Vote.deleteMany({ poll: pollId });

    // Delete the poll itself
    await Poll.findByIdAndDelete(pollId);

    // return response
    return res.status(200).json({
      success: true,
      message: "Poll Deleted Successfully",
    });
  } catch (error) {
    console.log("Error Occurred While Deleting the Poll");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error - We cannot Delete the Poll",
    });
  }
};
