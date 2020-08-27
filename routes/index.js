var express = require('express');
var jwt = require('jsonwebtoken');
var userModule = require('../modules/users')
var passDetailModel = require('../modules/add-pass-details')
var router = express.Router();
var bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');
const passCateModel = require('../modules/passCatagories');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
var getPassCat = passCateModel.find({})
var getAllPass = passDetailModel.find({})
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}
/* GET home page. */
function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModule.findOne({username:uname});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  
return res.render('signup', { title: 'Password Management System', message:'Username Already Exit' });

 }
 next();
  });
}

function checkEmail(req,res,next){
  var email=req.body.Email;
  var checkexitemail=userModule.findOne({email:email});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  
return res.render('signup', { title: 'Password Management System', message:'Email Already Exit' });

 }
 next();
  });
}

router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  if(loginUser){
    res.redirect('/dashboard')
  }
  else{
    res.render('index', { title: 'Password Management System', msg:'' });
  }

});

router.post('/', function(req, res, next) {

  var username = req.body.uname
  var password = req.body.password
  var checkUser = userModule.findOne({username:username})
  checkUser.exec((err,data)=>{
    if(err) throw err
    var getPassword = data.password
    var getUserID = data._id
    if(bcrypt.compareSync(password,getPassword)){
      var token = jwt.sign({ userID: getUserID }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', username);
      res.redirect('/dashboard')
    }
    else{

      res.render('index', { title: 'Password Management System', msg:'Invalid Username/Password' });

    }
  })
  
});

router.get('/dashboard',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  res.render('dashboard', { title: 'Password Management System', loginUser:loginUser, message:''});
});

router.get('/signup', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  if(loginUser){
    res.redirect('/dashboard')
  }
  else{
  res.render('signup', { title: 'Password Management System', message:''});
  }
});


router.post('/signup', checkEmail,checkUsername, function(req, res, next) {
  var username = req.body.uname;
  var email = req.body.Email;
  var password = req.body.password;
  var confirmPassword = req.body.Confpassword;
  if(confirmPassword!=password)
  {
    res.render('signup', { title: 'Password Management System', message:'Password not matched !'});
  }
  else{
    password = bcrypt.hashSync(password,10)
    var userDetails = new userModule({
      username:username,
      email:email,
      password:password
    })
    userDetails.save((err,data)=>{
      if(err) throw err;
      res.render('signup', { title: 'Password Management System', message:'User Reistered Successfully'});
  
    })

  }
  
  
});

router.get('/passwordCategory',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  // var Mylogin = getPassCat.find({username:loginUser})
  passCateModel.find({username:loginUser}).exec(function(err,data){
    if(err) throw err
    res.render('password_category', { title: 'Password Category List' , loginUser:loginUser, records:data});
  })
  
});

router.get('/passwordCategory/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pasCatID = req.params.id
  var pasCatDelete = passCateModel.findByIdAndDelete(pasCatID)
  pasCatDelete.exec(function(err,data){
    if(err) throw err
    res.redirect('/passwordCategory')
  })
  
});

router.get('/passwordCategory/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pasCatID = req.params.id
  var getpaswordCat = passCateModel.findById(pasCatID)
  getpaswordCat.exec(function(err,data){
    if(err) throw err
    res.render('edit-pas-cat', { title: 'Password Management System' , loginUser:loginUser, errors:'', success:'',records:data,id:pasCatID});
   
  })
  
});

router.post('/passwordCategory/edit',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pasCatID = req.body.id
  var passwordcat = req.body.passwordCategory
  var update_passCat = passCateModel.findByIdAndUpdate(pasCatID,{passord_category: passwordcat})
  update_passCat.exec(function(err,data){
    if(err) throw err
    res.redirect('/passwordCategory')
   
  })
  
});

router.get('/addNewCategory',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  res.render('addNewCategory', { title: 'Add New Category' , loginUser:loginUser, errors:'',success:''});
});

router.post('/addNewCategory',checkLoginUser,[check('passwordCategory', 'Enter Password Category Name').isLength({min:1})], function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var errors = validationResult(req)

  if(!errors.isEmpty())
  {
    console.log(errors.mapped())
    res.render('addNewCategory', { title: 'Add New Category' , loginUser:loginUser, errors:errors.mapped(),success:''});
  }
  else {
    var pasCatName = req.body.passwordCategory
    var pasCatDetails = new passCateModel({
      passord_category:pasCatName,
      username: loginUser
    })
    pasCatDetails.save((err,doc)=>{
      if(err) throw err;
      res.render('addNewCategory', { title: 'Add New Category' , loginUser:loginUser, errors:'', success:'Category has been inerted successfully'});

    })
   
  }
  
});
router.get('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  passCateModel.find({username:loginUser}).exec((err,data)=>{
    if(err) throw err
    res.render('addNewPassword', { title: 'Add New Password' , loginUser:loginUser, records:data, success:''});
  })
  
});
router.post('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pas_cat = req.body.pass_cat
  var project_name = req.body.project_name
  var pas_details = req.body.pass_details
  var password_add_details = new passDetailModel({
    password_category: pas_cat,
    password_detail: pas_details,
    project_name: project_name,
    username: loginUser


  })

    password_add_details.save(function(err,doc){
      if(err) throw err
      passCateModel.find({username:loginUser}).exec((err,data)=>{
        if(err) throw err
      res.render('addNewPassword', { title: 'Add New Password' , loginUser:loginUser, records:data,success:'Password Details Inserted Successfully'});
    })
    
  })
  
});

router.get('/view-all-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  // var myloginPass = getAllPass.find({username:loginUser})
  passDetailModel.find({username:loginUser}).exec((err,data)=>{
    if(err) throw err
    res.render('view-all-password', { title: 'All Passwords', loginUser:loginUser, records:data });
  })
  
});
router.get('/view-all-password/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pasid = req.params.id
  var pasdetailss = passDetailModel.findById(pasid)
  pasdetailss.exec((err,data)=>{
    if(err) throw err
    passCateModel.find({username:loginUser}).exec(function(err,data1){
    res.render('edit-pas-details', { title: 'All Passwords', loginUser:loginUser, records:data1,record:data,success:'' });
  })
})
  
});

router.get('/view-all-password/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var pasid = req.params.id
  var pasdelete = passDetailModel.findByIdAndDelete(pasid)
  pasdelete.exec((err,data)=>{
    if(err) throw err
    res.redirect('/view-all-password')
    
})
  
});

router.post('/view-all-password/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  var id = req.body.id
  var pascat = req.body.pass_cat
  var project = req.body.project_name
  var detalis = req.body.pass_details
  passDetailModel.findByIdAndUpdate(id,{
    password_category: pascat,
    password_detail: detalis,
    project_name : project

  }).exec((err,data)=>{
    if(err) throw err
    var pasdetailss = passDetailModel.findById(id)
    pasdetailss.exec((err,data)=>{
      if(err) throw err
      passCateModel.find({username:loginUser}).exec(function(err,data1){
      res.render('edit-pas-details', { title: 'All Passwords', loginUser:loginUser, records:data1,record:data,success:'Details Edited Successfully' });
    })
  })
  })
 
  
});


router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});
module.exports = router;
