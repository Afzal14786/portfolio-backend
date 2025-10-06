import { generate } from "otp-generator";

export const generateOtp = ()=> {
    const otp = generate(7, {
        upperCaseAlphabets: true,
        lowerCaseAlphabets: false,
        digits: true,
        specialChars: false,
    });

    return otp;
}