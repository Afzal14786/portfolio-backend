import mongoose from "mongoose";
import {publicUser} from "../../schemas/publicUser/publicUser.schema.js";

export const publicModel = new mongoose.model("PublicUser", publicUser);
