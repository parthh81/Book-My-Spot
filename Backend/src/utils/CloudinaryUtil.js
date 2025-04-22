const cloudinary = require("cloudinary").v2;

const uploadFileToCloudinary = async (file) => {

    //conif
        cloudinary.config({
        cloud_name:"dghnklgyv",
        api_key:"951822245526186",
        api_secret:"xerMzUwRDDZafWx91W3GRRaR7Cg"
    })

    const cloudinaryResponse = await cloudinary.uploader.upload(file.path);
    return cloudinaryResponse;

};
module.exports = {
    uploadFileToCloudinary
}