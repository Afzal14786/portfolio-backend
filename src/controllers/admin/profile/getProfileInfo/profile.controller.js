/**
 * @description This file is responsible for fetching basic information of the user's like 
 *  1. Socail Media Links
 *  2. Resources Links
 *  3. Hobbies
 *  4. Profile Information Like (name, user_name, profile_image, banner_image, resume)
 */

import {adminModel} from "../../../../models/admin/user.model.js";

export const getProfile = async(req, res)=> {
    try {
        const userId = req.user.id;
        const user = await adminModel.findOne({id: userId});

        if (!user) {
            return res.status(400).json({
                message: "user is not found, please register",
                success: false,
            });
        }

        // returning the complete user in the forntend
        return res.status(200).json({
            message: "User fetch successfully",
            success: true,
            user: user,
        });

    } catch (err) {
        console.error(`Error while getting user's information : ${err}`);
        return res.status(500).json({
            message: "internal server error while getting user information",
            success: false,
        });
    }
}