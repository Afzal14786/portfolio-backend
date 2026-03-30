import {certificateModel} from "../../models/certificate/certificate.model.js";

export const createCertificate = async (req, res, next) => {
  try {
    const { courseName, instituteName, teacherName, skills } = req.body;
    const certificateImage = req.files?.certificateImage ? req.files.certificateImage[0].path : "";
    const teacherImage = req.files?.teacherImage ? req.files.teacherImage[0].path : "";

    let skillsArray = [];
    if (skills) {
      skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    const certificate = await certificateModel.create({
      courseName,
      instituteName,
      teacherName: teacherName || "",
      teacherImage,
      skills: skillsArray,
      certificateImage,
      user_id: req.user._id,
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

export const getCertificates = async (req, res, next) => {
  try {
    const certificates = await certificateModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    await certificateModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Certificate deleted" });
  } catch (error) { 
    next(error);
  }
};

export const updateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseName, instituteName, teacherName, skills } = req.body;

    let certificate = await certificateModel.findById(id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Retain existing data if new data is not provided
    const updateData = {
      courseName: courseName || certificate.courseName,
      instituteName: instituteName || certificate.instituteName,
      teacherName: teacherName !== undefined ? teacherName : certificate.teacherName,
    };

    if (skills) {
      updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    if (req.files?.certificateImage) {
      updateData.certificateImage = req.files.certificateImage[0].path;
    }
    if (req.files?.teacherImage) {
      updateData.teacherImage = req.files.teacherImage[0].path;
    }

    const updatedCertificate = await certificateModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, certificate: updatedCertificate });
  } catch (error) {
    next(error);
  }
};