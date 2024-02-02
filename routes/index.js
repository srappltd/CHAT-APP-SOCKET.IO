var express = require("express");
var router = express.Router();
const passport = require("passport")
const googleStrategy = require("passport-google-oauth20").Strategy

const { userModel, groupModel} = require("../models/userModel");
const {userMulter} = require("../multer/multer")

// middleware for authenticating
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/login")
}


/* GET home page. */
router.get("/",isLoggedIn, async function (req, res, next) {
    const user = await userModel.findById(req.user._id);
    return res.render("index", { user });
});
router.get("/login", function (req, res, next) {
  if(req.user){
    return res.redirect("/")
  }
  res.render("login");
});
router.get("/register", function (req, res, next) {
  if(req.user){
    return res.redirect("/")
  }
  res.render("register");
});

// email and password authentication
router.post("/login", passport.authenticate("local",{
  successRedirect:"/",
  failureRedirect:"/login",
  // failureFlash:true
}))
router.post('/register',userMulter.single("picture"),async function(req, res, next) {
  const {name,username,email,password,mobile} =req.body
  const userFind = await userModel.findOne({email})
  if(name && username && email && password && mobile){
    if(userFind){
      return res.redirect("/login")
    }
    userModel.register(new userModel({name, username, email, mobile, picture:`../images/${req.file.filename}`}),password).then(register=>{
      passport.authenticate("local")(req,res,()=>{
        return res.redirect("/")
      })
    })
  }else{
    res.send("All field must be required")
  }
});

// google authorization
router.get("/login/federated/google",passport.authenticate("google"))
router.get("/oauth2/redirect/google",passport.authenticate("google",{
  successRedirect:"/",
  failureRedirect:"/login"
}))
// google authorization
passport.use(new googleStrategy({
  clientID:process.env.GOOGLE_ID,
  clientSecret:process.env.GOOGLE_SEC,
  callbackURL:"/oauth2/redirect/google",
  scope:['profile','email','openid']
},async (accessToken,refreshToken,profile,cb)=>{
  console.log(profile)
  const userFind = await userModel.findOne({googleid:profile.id})
  if(userFind){
    return cb(null,userFind)
  }
  const userData = await userModel.create({
    name:profile.displayName,
    email:profile.emails[0].value,
    picture:profile.photos[0].value,
    googleid:profile.id,
  }) 
  cb(null,userData)
}))


router.post("/upload/:groupid",isLoggedIn,userMulter.single("image"),async (req,res)=>{
  if(req.user){
    console.log(req.user)
    const group = await groupModel.findById(req.params.groupid)
    group.picture = `../images/${req.file.filename}` 
    await group.save()
    res.json(group);
  }
})

module.exports = router;
