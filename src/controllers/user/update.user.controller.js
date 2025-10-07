import {userModel} from "../../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * User should be able to update
 *  1. Name
 *  2. email
 *  3. password
 *  4. image
 *  5. pdf
 *  6. hobbies:[]
 *  7. banner image
 *  9. social media     {user will submit the link of the social media}
 */

export const updateProfile = async (req, res)=> {
    // update user basic information
}

export const updatePassword = async (req, res)=> {
    // update the password here
}

export const resetPassword = async (req, res)=> {
    // reset the password here 
}