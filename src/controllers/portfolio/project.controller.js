import {projectModel} from "../../models/project/project.model.js";

export const createProject = async (req, res, next) => {
  try {
    const { title, description, status, techStack, codeLink, demoLink } = req.body;
    // Assuming multer/cloudinary middleware attaches the image URL to req.file.path
    const imageUrl = req.file ? req.file.path : "";

    const project = await projectModel.create({
      title,
      description,
      status,
      techStack: techStack ? JSON.parse(techStack) : [],
      codeLink,
      demoLink,
      imageUrl,
      author_id: req.user._id // Assuming JWT auth middleware sets req.user
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectModel.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Add this below your deleteProject function
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, techStack, codeLink, demoLink } = req.body;

    // 1. Find the existing project first
    let project = await projectModel.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 2. Build the update object with new values, or keep existing ones if not provided
    const updateData = {
      title: title || project.title,
      description: description || project.description,
      status: status || project.status,
      codeLink: codeLink || project.codeLink,
      demoLink: demoLink || project.demoLink,
    };

    // 3. Handle techStack safely (often sent as stringified JSON from FormData)
    if (techStack) {
      updateData.techStack = typeof techStack === "string" ? JSON.parse(techStack) : techStack;
    }

    // 4. Handle optional new image upload
    if (req.file) {
      updateData.imageUrl = req.file.path; // New Cloudinary URL overrides the old one
    }

    // 5. Apply the updates to the database
    const updatedProject = await projectModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return the updated document
    );

    res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    next(error);
  }
};