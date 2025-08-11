import multer from "multer";
const upload = multer({ dest: "uploads/" });

//user profile-picture middleware
const profilePicture = upload.single("profilePics");

//product images middleware
const productImages = upload.array("images", 15);

export { profilePicture, productImages };
