const Role = require('../models/role');
const { logUserAction } = require('../middlewares/activityLogger');

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = new Role({ name, permissions });
    await logUserAction({ req, action: "create_role",});
    await role.save();
    res.status(201).json({status: 1, message: "Role Created Successfully", role});
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "create_role",});
    res.status(400).json({status: 0, message: error.message });
  }
};

// Get all Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ status: 1, message: "Successfully", roles });
  } catch (error) {
    res.status(500).json({status: 0, message: error.message });
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({status: -1, message: 'Role not found' });
    res.json({status : 1, message: "Successfully", role});
  } catch (error) {
    res.status(500).json({status: 0, message: error.message });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions },
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({status: -1, message: 'Role not found' });
    await logUserAction({ req, action: "update_role",});
    res.json({status: 1, message: "Successfully", role});
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "update_role",});
    res.status(400).json({status: 0, message: error.message });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({status: -1, message: 'Role not found' });
    await logUserAction({ req, action: "delete_role",});
    res.json({ message: 'Role deleted successfully', status: 1, role });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "delete_role",});
    res.status(500).json({status: 0, message: error.message });
  }
};
