const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Booking", "Payment", "Equipment", "Technical", "Other"],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In-Progress", "Resolved", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
