const User = require("../models/User");

const ensureDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  try {
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }, { isAdmin: true }],
    });

    if (existingAdmin) {
      const updates = {};
      if (!existingAdmin.isAdmin) updates.isAdmin = true;
      if (existingAdmin.email !== adminEmail) updates.email = adminEmail;
      if (existingAdmin.username !== adminUsername) updates.username = adminUsername;

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(existingAdmin._id, updates, { new: true });
      }

      return existingAdmin;
    }

    const adminUser = await User.create({
      name: "Admin",
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      loginCount: 0,
    });

    console.log(`✅ Default admin created: ${adminEmail}`);
    return adminUser;
  } catch (error) {
    console.error("❌ Failed to ensure default admin:", error.message);
    throw error;
  }
};

module.exports = { ensureDefaultAdmin };
