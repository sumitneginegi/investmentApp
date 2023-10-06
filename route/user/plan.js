const express = require("express");
const {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    subscribeToPlan,
} = require("../../controller/user/plans");


const verifyToken = require("../../middleware/auth");

// Define allowed roles for a specific API
const allowedRoles1 = ["admin", "subadmin", "employer"];
const allowedRoles2 = ["admin", "subadmin", "manpower"];
const allowedRoles3 = ["admin", "subadmin", "agent"];
const allowedRoles4 = ["admin", "subadmin"];
const allowedRoles5 = ["admin"];


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


// router.post("/registrationthroughAdmin",verifyToken.verifyToken(allowedRoles4),registrationthroughAdmin);
//////////////////////////////////////////////////////////////////////////////

router.post("/registration/plan", createPlan);
// router.post("/sendotp/Customer", sendotpCustomer);
// router.post("/sendotpCustomer/Login", sendotpCustomerLogin);
router.get("/getAllPlans", getAllPlans);
router.get("/getPlanBy/Id/:id", getPlanById);
router.put("/updatePlan/Id/:id", updatePlan);
router.delete("/deletePlan/Id/:id", deletePlan);
router.put("/subscribeToPlan/Id/:id", subscribeToPlan);


module.exports = router;
