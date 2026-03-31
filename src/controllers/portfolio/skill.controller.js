import { skillModel } from "../../models/skills/skills.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;
    const pathWithoutVersion = parts[1].replace(/^v\d+\//, '');
    return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));
  } catch (error) {
    return null;
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const { title, tags } = req.body;
    let icon = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/skills");
      icon = result.secure_url;
    }

    const skill = await skillModel.create({ 
      title, 
      icon, 
      tags: tags ? JSON.parse(tags) : [],
      user_id: req.user._id 
    });
    
    res.status(201).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const skills = await skillModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, tags } = req.body;

    let skill = await skillModel.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    const updateData = {
      title: title || skill.title,
    };

    if (tags) {
      updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    if (req.file) {
      if (skill.icon) {
        const publicId = extractPublicId(skill.icon);
        if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
      }
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/skills");
      updateData.icon = result.secure_url;
    }

    const updatedSkill = await skillModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, skill: updatedSkill });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await skillModel.findByIdAndDelete(id);
    
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    if (skill.icon) {
      const publicId = extractPublicId(skill.icon);
      if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
    }

    res.status(200).json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};