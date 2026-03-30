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