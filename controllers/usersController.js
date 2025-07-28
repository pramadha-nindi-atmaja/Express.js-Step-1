const { v4: uuidv4 } = require("uuid");
const Users = require("../models/Users");

module.exports = {
  // Display a listing of users with optional search functionality
  index: async (req, res) => {
    try {
      // Create search query if search parameter exists
      const searchQuery = req.query.search 
        ? { name: { $regex: req.query.search, $options: 'i' } } 
        : {};
      
      // Find users matching search criteria
      const users = await Users.find(searchQuery).select("name _id");
      
      res.render("pages/users/index", { users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).render("pages/error", { error: "Failed to fetch users" });
    }
  },

  // Show form to create a new user
  create: (req, res) => {
    res.render("pages/users/create");
  },

  // Store a newly created user
  store: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      await Users.create({
        id: uuidv4(),
        name,
        email,
        password, // Note: In production, this should be hashed
      });
      
      res.redirect("/users");
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).render("pages/users/create", { 
        error: "Failed to create user",
        formData: req.body 
      });
    }
  },

  // Display a specific user
  show: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
      
      if (!user) {
        return res.status(404).render("pages/error", { error: "User not found" });
      }
      
      res.render("pages/users/detail", { user });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).render("pages/error", { error: "Failed to fetch user details" });
    }
  },

  // Show form to edit user
  edit: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
      
      if (!user) {
        return res.status(404).render("pages/error", { error: "User not found" });
      }
      
      res.render("pages/users/edit", { user });
    } catch (error) {
      console.error("Error fetching user for edit:", error);
      res.status(500).render("pages/error", { error: "Failed to fetch user" });
    }
  },

  // Update the specified user
  update: async (req, res) => {
    try {
      const { name, email } = req.body;
      
      const user = await Users.findByIdAndUpdate(
        req.params.id, 
        { name, email },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).render("pages/error", { error: "User not found" });
      }
      
      res.redirect("/users");
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).render("pages/error", { 
        error: "Failed to update user",
        formData: req.body 
      });
    }
  },

  // Remove the specified user
  destroy: async (req, res) => {
    try {
      const result = await Users.findByIdAndDelete(req.params.userId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      const users = await Users.find().select("name _id");
      
      res.json({
        success: true,
        data: users,
        message: "User deleted successfully",
        method: req.method,
        url: req.url
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user"
      });
    }
  }
};