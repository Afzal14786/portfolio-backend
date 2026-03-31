import { projectModel } from "../../models/project/project.model.js";
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

export const createProject = async (req, res, next) => {
  try {
    const { title, description, status, techStack, codeLink, demoLink } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/projects");
      imageUrl = result.secure_url;
    }

    const project = await projectModel.create({
      title,
      description,
      status,
      techStack: techStack ? JSON.parse(techStack) : [],
      codeLink,
      demoLink,
      imageUrl,
      author_id: req.user._id 
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error(`Error while creating a project : ${error}`);
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error(`error while fetching projects: ${error}`);
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectModel.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    if (project.imageUrl) {
      const publicId = extractPublicId(project.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch(err => console.error("Cloudinary delete error:", err));
      }
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error(`Error while deleting project : ${error}`);
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, techStack, codeLink, demoLink } = req.body;

    let project = await projectModel.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const updateData = {
      title: title || project.title,
      description: description || project.description,
      status: status || project.status,
      codeLink: codeLink !== undefined ? codeLink : project.codeLink,
      demoLink: demoLink !== undefined ? demoLink : project.demoLink,
    };

    if (techStack) {
      updateData.techStack = typeof techStack === "string" ? JSON.parse(techStack) : techStack;
    }

    if (req.file) {
      if (project.imageUrl) {
        const publicId = extractPublicId(project.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(err => console.error("Cloudinary delete error:", err));
        }
      }

      const result = await uploadToCloudinary(req.file.buffer, "portfolio/projects");
      updateData.imageUrl = result.secure_url;
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } 
    );

    res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    console.error(`Error while updating a project : ${error}`);
    next(error);
  }
};