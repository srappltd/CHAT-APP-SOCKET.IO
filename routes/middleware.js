const Login = (req,res,next)=>{
    if(req.session.user){
    res.redirect('/')
    }else{
    }
    next()
    }
const Logout = (req,res,next)=>{
if(req.session.user){
}else{
res.redirect('/login')
}
next()
}
module.exports = {Login,Logout}