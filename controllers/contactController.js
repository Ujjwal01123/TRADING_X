const Contact = require("../models/Contact");

// Submit a contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newContact = await Contact.create({ name, email, subject, message });

    res.status(201).json({
      message: "Your message has been submitted successfully.",
      contact: newContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get all contact messages (admin)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get a single contact message by ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete a contact message by ID
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
