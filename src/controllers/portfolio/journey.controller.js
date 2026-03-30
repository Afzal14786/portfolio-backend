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