const SupportTicket = require("../models/SupportTicket");
const Booking = require("../models/Booking");

const createTicket = async (req, res) => {
  try {
    const { subject, category, bookingId, message } = req.body;
    const customerId = req.user.id;

    if (!subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject, category, and message are required",
      });
    }

    // Optional booking validation
    if (bookingId) {
      const bookingExists = await Booking.findOne({ _id: bookingId, customer: customerId });
      if (!bookingExists) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or not owned by you",
        });
      }
    }

    let ticketId;
    let isUnique = false;
    while (!isUnique) {
      const num = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      ticketId = `TKT-${num}`;
      const existing = await SupportTicket.findOne({ ticketId });
      if (!existing) isUnique = true;
    }

    const ticket = await SupportTicket.create({
      ticketId,
      customer: customerId,
      subject,
      category,
      bookingId: bookingId || undefined,
      message,
    });

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("bookingId", "bookingNumber startDate endDate");

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: populatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const customerId = req.user.id;
    const tickets = await SupportTicket.find({ customer: customerId })
      .populate({
        path: "bookingId",
        select: "bookingNumber startDate endDate equipment",
        populate: {
          path: "equipment",
          select: "name brand",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
};
