import {skillModel} from "../../models/skills/skills.model.js";

export const createSkill = async (req, res, next) => {
  try {
    const { title, tags } = req.body;
    const skill_icon = req.file ? req.file.path : "";

    const skill = await skillModel.create({ 
      title, 
      skill_icon, 
      tags: tags ? JSON.parse(tags) : [] 
    });
    
    res.status(201).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const skills = await skillModel.find();
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

    // Override existing Cloudinary image ONLY if a new one is uploaded
    if (req.file) {
      updateData.skill_icon = req.file.path;
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

    res.status(200).json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};