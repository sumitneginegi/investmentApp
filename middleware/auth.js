const User = require("../model/user")
const jwt = require("jsonwebtoken")

exports.verifyToken = (req, res, next) => {
  const token =
    req.get("Authorization")?.split("Bearer ")[1] ||
    req.headers["x-access-token"]

  if (!token) {
    return res.status(403).send({
      message: "no token provided! Access prohibited",
    })
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(401).send({
          message: "UnAuthorised !",
        })
      }
    
      const user = await User.findOne({ _id: decoded.admin })
      console.log(user)
      if (!user) {
        return res.status(400).send({
          message: "The user that this token belongs to does not exist",
        })
      }
      const allowedRoles = ["manpower", "employer", "agent", "admin"];

      if (!allowedRoles.includes(user.userType)) {
        return res.status(403).send({
          message: "You are not authorized to access this resource",
        })
      }
      req.user = user
      next()
    })
  } catch (err) {
    return res.status(400).send({
      message: err.message,
    })
  }
}

