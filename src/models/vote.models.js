import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    selectedOption: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: async function (value) {
          const pollDocument = await mongoose.model("Poll").findById(this.poll);
          return pollDocument && pollDocument.options.includes(value);
        },
        message:
          "Selected option must be one of the valid options for the poll.",
      },
    },

    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vote", voteSchema);
