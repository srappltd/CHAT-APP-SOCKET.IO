var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt")


const { Login, Logout } = require("./middleware");
const { userModel, groupModel} = require("../models/userModel");
const {userMulter} = require("../multer/multer")

/* GET home page. */
router.get("/",Logout, async function (req, res, next) {
  if(req.session.user){
    const user = await userModel.findById(req.session.user._id);
    res.render("index", { user });
  }
});
router.get("/login", Login, function (req, res, next) {
  res.render("login");
});
router.get("/register", Login, function (req, res, next) {
  res.render("register");
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const userFind = await userModel.findOne({ email });
  if (email && password) {
    if (userFind) {
      const passhash = await bcrypt.compare(password, userFind.password);
      if (userFind.email == email && passhash) {
        req.session.user = userFind;
        res.redirect("/");
      } else {
        res.render("login", { error: "Email & Password mismatch" });
      }
    } else {
      res.render("login", { error: "User not exist!" });
    }
  } else {
    res.render("login", { error: "Allfields required" });
  }
});
router.post("/register",userMulter.single("picture"),
  async (req, res, next) => {
    const { name, email, mobile, password } = req.body;
    const userFind = await userModel.findOne({ email });
    if (email && password && name && mobile) {
      if (!req.file) {
        return res.render("register", { error: "Picture not found!" });
      }
      if (!userFind) {
        const passhash = await bcrypt.hash(password, 10);
        const data = await userModel.create({picture: req.file.filename,name,email,mobile,password: passhash,
        });
        req.session.user = data;
        res.redirect("/");
      } else {
        res.render("register", { error: "User allready exist!" });
      }
    } else {
      res.render("register", { error: "Allfields required" });
    }
  }
);

router.post("/upload/:groupid",Logout,userMulter.single("image"),async (req,res)=>{
  if(req.session.user){
    console.log(req.file)
    const group = await groupModel.findById(req.params.groupid)
    group.picture = req.file.filename
    await group.save()
    res.json(group);
  }
})

module.exports = router;
