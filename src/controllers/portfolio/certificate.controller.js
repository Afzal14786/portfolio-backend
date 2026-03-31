import { certificateModel } from "../../models/certificate/certificate.model.js";
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

export const createCertificate = async (req, res, next) => {
  try {
    const { courseName, instituteName, teacherName, skills } = req.body;
    let certificateImage = "";
    let teacherImage = "";

    if (req.files?.certificateImage && req.files.certificateImage[0]) {
      const result = await uploadToCloudinary(req.files.certificateImage[0].buffer, "portfolio/certificates");
      certificateImage = result.secure_url;
    }

    // 🔥 FIX: Upload Teacher Image from Memory Buffer
    if (req.files?.teacherImage && req.files.teacherImage[0]) {
      const result = await uploadToCloudinary(req.files.teacherImage[0].buffer, "portfolio/teachers");
      teacherImage = result.secure_url;
    }

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
    const certificate = await certificateModel.findByIdAndDelete(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

    if (certificate.certificateImage) {
      const publicId = extractPublicId(certificate.certificateImage);
      if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
    }
    if (certificate.teacherImage) {
      const publicId = extractPublicId(certificate.teacherImage);
      if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
    }

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

    const updateData = {
      courseName: courseName || certificate.courseName,
      instituteName: instituteName || certificate.instituteName,
      teacherName: teacherName !== undefined ? teacherName : certificate.teacherName,
    };

    if (skills) {
      updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    if (req.files?.certificateImage && req.files.certificateImage[0]) {
      if (certificate.certificateImage) {
        const publicId = extractPublicId(certificate.certificateImage);
        if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
      }
      const result = await uploadToCloudinary(req.files.certificateImage[0].buffer, "portfolio/certificates");
      updateData.certificateImage = result.secure_url;
    }

    if (req.files?.teacherImage && req.files.teacherImage[0]) {
      if (certificate.teacherImage) {
        const publicId = extractPublicId(certificate.teacherImage);
        if (publicId) await deleteFromCloudinary(publicId).catch(e => console.error(e));
      }
      const result = await uploadToCloudinary(req.files.teacherImage[0].buffer, "portfolio/teachers");
      updateData.teacherImage = result.secure_url;
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