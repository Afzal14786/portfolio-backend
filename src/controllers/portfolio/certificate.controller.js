import {certificateModel} from "../../models/certificate/certificate.model.js";

export const createCertificate = async (req, res, next) => {
  try {
    const { course_name, institute_name, teacher_name } = req.body;
    const certificate_image = req.file ? req.file.path : "";

    const certificate = await certificateModel.create({
      course_name,
      institute_name,
      teacher_name,
      certificate_image,
      user_id: req.user._id
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