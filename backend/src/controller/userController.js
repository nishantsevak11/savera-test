import userModel from "../models/user.model.js";
import { loginUserService, registerUserService, getUserDataService } from "../service/authService.js";
import { scheduleService } from "../service/schedule.js";

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await loginUserService(email, password);
    res.status(200).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const userData = await registerUserService(req.body);
    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    // Only admin should be able to get all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const users = await userModel.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await getUserDataService(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only allowed fields
    const { name, email, sendTime, period, categories, AiPrompt} = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (sendTime) user.sendTime = sendTime;
    if (period) user.period = period;
    if (categories) user.categories = categories;
    if (AiPrompt) user.AiPrompt = AiPrompt;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      sendTime: updatedUser.sendTime,
      period: updatedUser.period
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { loginUser, registerUser, getUsers, getUserProfile, updateUser };
