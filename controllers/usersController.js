const { v4: uuidv4 } = require("uuid");
const Users = require("../models/Users");

module.exports = {
  /** 
   * Display a list of users (with optional search)
   */
  index: async (req, res) => {
    try {
      const { search } = req.query;
      const filter = search ? { name: new RegExp(search, "i") } : {};

      const users = await Users.find(filter).select("name _id");
      res.render("pages/users/index", { users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).render("pages/error", { error: "Failed to fetch users" });
    }
  },

  /** 
   * Show create user form
   */
  create: (req, res) => {
    res.render("pages/users/create");
  },

  /** 
   * Store new user
   */
  store: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      await Users.create({
        id: uuidv4(),
        name,
        email,
        password, // ⚠️ TODO: Hash password before saving (e.g. bcrypt)
      });

      res.redirect("/users");
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).render("pages/users/create", {
        error: "Failed to create user",
        formData: req.body,
      });
    }
  },

  /** 
   * Show single user details
   */
  show: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);

      if (!user)
        return res.status(404).render("pages/error", { error: "User not found" });

      res.render("pages/users/detail", { user });
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).render("pages/error", { error: "Failed to fetch user details" });
    }
  },

  /** 
   * Show edit form
   */
  edit: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);

      if (!user)
        return res.status(404).render("pages/error", { error: "User not found" });

      res.render("pages/users/edit", { user });
    } catch (err) {
      console.error("Error fetching user for edit:", err);
      res.status(500).render("pages/error", { error: "Failed to fetch user" });
    }
  },

  /** 
   * Update user
   */
  update: async (req, res) => {
    try {
      const { name, email } = req.body;

      const updatedUser = await Users.findByIdAndUpdate(
        req.params.id,
        { name, email },
        { new: true }
      );

      if (!updatedUser)
        return res.status(404).render("pages/error", { error: "User not found" });

      res.redirect("/users");
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).render("pages/error", {
        error: "Failed to update user",
        formData: req.body,
      });
    }
  },

  /** 
   * Delete user
   */
  destroy: async (req, res) => {
    try {
      const { userId } = req.params;
      const deletedUser = await Users.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const users = await Users.find().select("name _id");

      res.json({
        success: true,
        message: "User deleted successfully",
        data: users,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  },
};
