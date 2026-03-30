import {journeyModel} from "../../models/journey/journey.model.js";

export const createJourneyEvent = async (req, res, next) => {
  try {
    const { year, title, description } = req.body;
    const event = await journeyModel.create({ year, title, description, user_id: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

export const getJourney = async (req, res, next) => {
  try {
    // Sort by year descending to create a timeline
    const journey = await journeyModel.find().sort({ year: -1 });
    res.status(200).json({ success: true, journey });
  } catch (error) {
    next(error);
  }
};

export const updateJourneyEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year, title, description } = req.body;

    let event = await journeyModel.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Journey event not found" });
    }

    const updateData = {
      year: year || event.year,
      title: title || event.title,
      description: description || event.description,
    };

    const updatedEvent = await journeyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// --- NEW: Delete Journey Event ---
export const deleteJourneyEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await journeyModel.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Journey event not found" });
    }

    res.status(200).json({ success: true, message: "Journey event deleted successfully" });
  } catch (error) {
    next(error);
  }
};