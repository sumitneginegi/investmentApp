const express = require("express");
const {
    registrationCustomer,
    sendotpCustomer,
    sendotpCustomerLogin
} = require("../../controller/admin/admin");

const {verifyToken} = require("../../middleware/auth")
const router = express.Router();

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
  },
});
const upload = multer({ storage: storage });


cloudinary.config({
  cloud_name: "dsi1yv3xi",
  api_key: "343572995738873",
  api_secret: "wrcHAy3wkDu8jhv0UHYlMpYmdDQ",
});


router.post("/registrationthroughAdmin",/*verifyToken, */ registrationthroughAdmin);
//////////////////////////////////////////////////////////////////////////////

// router.post("/registration/Customer", registrationCustomer);
// router.post("/sendotp/Customer", sendotpCustomer);
// router.post("/sendotpCustomer/Login", sendotpCustomerLogin);



module.exports = router;
