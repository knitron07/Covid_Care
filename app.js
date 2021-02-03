 var bodyParser       = require("body-parser"),
methodOverride       = require("method-override"),
mongoose             = require("mongoose"),
express              = require("express"),
app                  = express(),
moment               = require(__dirname+"/models/moments.js"),
passport             =require("passport"),
flash                =require("connect-flash"),
localStrategy        =require("passport-local"),
	 async           =require("async"),
 crypto              =require("crypto"),
passportLocalMongoose=require("passport-local-mongoose"),
user                 =require(__dirname+"/models/user.js"),
	 comment         =require("./models/comments");
// var admin=require("./models/admin");
const cloudinary = require("cloudinary");
const multer  = require("multer");
const path=require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');

mongoose.connect("mongodb+srv://komal:opnm22@cluster0.o53xo.mongodb.net/moments",{useNewUrlParser:true ,useUnifiedTopology: true ,useFindAndModify: false ,useCreateIndex:true});

app.use(flash());

app.use(require("express-session")({
		secret:"Komal",
	    resave:false,
	    saveUninitialized:false
		}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentUser= req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
})




// app.use("/admin",admin);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));


cloudinary.config({
  cloud_name:"covidcare221",
  api_key:714594874232419,
  api_secret:"fFc7j8T7iZrW508hJOO8fEL656s"
});



var storage = multer.diskStorage({
 fileFilter:(req,file,cb)=>{
    if(!file.mimetype.match(jpe|jpeg|png|gif$i)){
      cb(new Error("file is not suported"), false);
      return
    }
    cb(null,true)
  }
});

var upload = multer({ storage: storage });


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'covidcare221@gmail.com',
    pass: '717368.kmsm'
  }
});

//function to calculate distance between author and user
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6378;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
}

//covid routes
app.get("/",function(req,res){
	res.redirect("/moments");
});
app.get("/moments",isLoggedIn,function(req,res){

	moment.find({},function(err,moments){
		if(err){
			console.log(err);
		}else{
			res.render("moments/index",{moments:moments,currentUser:req.user});
		}
	});

});
app.post("/moments",upload.single("postImage"),isLoggedIn, async function(req,res){
	const result= await cloudinary.v2.uploader.upload(req.file.path);
	const oment= new moment({
	title: req.body.postTitle,
	photopath: result.url,
	body: req.body.postBody,
	email:req.body.phoneNumber,
    postlat:req.body.postLat,
    postlng:req.body.postLng,
	author:{
		id: req.user._id,
		username:req.user.username
	}
});
	var mailOptions = {
    from:"covidcare221@gmail.com",
    to:"receivercovidcare221@gmail.com",
    subject:req.body.postTitle,
    text:req.body.postBody,
    attachments:[
      {filename:"photo.png", path:result.url}
    ]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
oment.save(function(err){
	if(err){
	 res.redirect("moments/new");
    }else{
	 req.flash("success","Your Post Has Been Uploaded Successfully");
	 res.redirect("/moments");
 }
});


});
app.get("/moments/new",isLoggedIn,function(req,res){
	res.render("moments/new",{currentUser:req.user});
	});

app.get("/moments/:id",isLoggedIn,function(req,res){

	moment.findById(req.params.id).populate("comments").exec(function(err,foundmoment){
		if(err){
			res.redirect("/moments");
		} else{
			res.render("moments/show",        {moment:foundmoment});
		}
	});

});
app.get("/moments/:id/edit",isLoggedIn,function(req,res){
	moment.findById(req.params.id,function(err,foundmoment){
		if(err){
			req.flash("error","No Post Found");
			res.redirect("/moments");
		}else{

			if(foundmoment.author.id.equals(req.user._id)){
			res.render("moments/edit",{moment:foundmoment});
			} else{
				req.flash("error","You Don't Have Permission To Edit The Post");
				res.redirect("back");
			}
		}
	});

});
app.put("/moments/:id",upload.single("postImage"),isLoggedIn,async function(req,res){

   const result= await cloudinary.v2.uploader.upload(req.file.path);

   console.log(req.body);
	moment.findByIdAndUpdate(req.params.id, {title:req.body.postTitle,  email:req.body.email ,photopath:result.url, body:req.body.postBody} ,function(err,updated){
		if(err){
      console.log(err);
			res.redirect("/moments");
		}else{
			req.flash("success"," Your Post Has Been Successfully Updated");
			res.redirect("/moments/"+req.params.id);
		}

	});
});


app.delete("/moments/:id",isLoggedIn,function(req,res){

	moment.findByIdAndRemove(req.params.id, function(err,foundpost){

		if(err){
			console.log(err);
			   }
		else {
			    if(foundpost.author.id.equals(req.user._id)){
					req.flash("success"," Your Post Has Been Deleted Successfully");
			res.redirect("/moments");
			} else{
				res.send("no permission");
			}
		}

		});
	});







//comment routes
app.get("/moments/:id/comments/new",isLoggedIn,function(req,res){
	moment.findById(req.params.id,function(err,moment){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{moment:moment});
		}
	});

});
app.post("/moments/:id/comments/new",isLoggedIn, function(req,res){
	moment.findById(req.params.id,function(err,moment){
		if(err){
			req.flash("error","Something Went Wrong!!")
			console.log(err);
		}
		else{
			comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}else{
					comment.author._id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					moment.comments.push(comment);
					moment.save();
					req.flash("success","Your Comment Has Been Added Successfully!!")
					res.redirect("/moments/"+ moment._id);
				}
			})
		}
	});
});
app.get("/covid-tracker",function(req,res){
	res.render("moments/covid");
})

//Auth routes

app.get("/",function(req,res){
	res.render("home");
});


app.get("/register",function(req,res){
	res.render("register");

});
//2
app.post("/register",function(req,res){
   console.log(req.body);
	user.register(new user({
		username:req.body.username,
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		email:req.body.email}),req.body.password,function(err,user){
		if(err){

			console.log(err);
			return res.render("register",{"error":err.message});
		}

		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome To Covid Care"+" " + user.username);
			res.redirect("/moments");
		});
	});
});

app.get("/login",function(req,res){
	res.render("login");
});
var express= require("express");
var router = express.Router();


app.post("/login",passport.authenticate("local",{
	successRedirect:"/moments",
	faailureRedirect:"/login",

}),function(req,res){

});

app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You Have Been Logged  Out Successfully!!");
	res.redirect("/login");
})
app.get("/user/:id",function(req,res){

	user.findById(req.params.id,function(err,found){
		if(err){
			res.redirect("/index");
		}else{
			console.log(found);
			res.render("moments/showuser",{user:found});
		}
	});
});

 app.get("/forgot",function(req,res){
	 res.render("forgot");
 });
app.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
		  console.log(token);
        done(err, token);
      });
    },
    function(token, done) {
      user.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 900000;

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      var mailOptions = {
        to: user.email,
        from: 'covidcare221@gmail.com',
        subject: 'Covid Care Password Reset',
        text:
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

app.get('/reset/:token', function(req, res) {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('moments/reset', {token: req.params.token});
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {

      var mailOptions = {
        to: user.email,
        from: 'covidcare221@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
});


//Sorting posts on the basis of authors location
app.post("/safezone/:dist",function(req,res){
var distance=req.params.dist;
var filterMoments=[];

  moment.find({},function(err,moments){
   moments.forEach(function(moment){
     var lat1=req.body.userlat;
     var lng1=req.body.userlng;
     var lat2=moment.postlat;
     var lng2=moment.postlng;

      const x=distanceInKmBetweenEarthCoordinates(lat1,lng1,lat2,lng2);
      if(x<=distance){
        filterMoments.push(moment);
      }

   });

			 res.render("moments/index",{moments:filterMoments});

	});

});
app.get("/aboutus",function(req,res){
	res.render("moments/aboutus");
});
app.get("/contactus",function(req,res){
	res.render("moments/contactus");
});
app.post("/contactus",function(req,res){
	 var mailOptions = {
        to: "komalmahto22@gmail.com,samarmahur1992@gmail.com",
        from: "covidcare221@gmail.com",
        subject: req.body.fullName,
        text: req.body.message+"      "+req.body.email
      };
      transporter.sendMail(mailOptions, function(err) {
         if(!err){
          req.flash("success"," Your message Has Been Sent to Covid Care Developers Successfully !!");
			 res.redirect("/contactus");
		 }else{
			 console.log(err);
		 }
      });
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login First");
	res.redirect("/login");
}

// rout to search by name of userl
app.post("/search_by_name",function(req,res){

  user.findOne({ username:req.body.Name }, function (err,user){
    if(err)
    {
      req.flash("error"," something went wrong ");
      res.redirect("/moments");
    }
    if(user)
    {
      var filterMoments=[];

        moment.find({email:user.email},function(err,moments){
         moments.forEach(function(moment){
              filterMoments.push(moment);
         });

      			 res.render("moments/index",{moments:filterMoments});

      	});
    }
    else
    {
      req.flash("error"," user not found ");
      res.redirect("/moments");
    }

  });
});

//
// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

app.listen(3000, function() {
  console.log("Server started 3000");
});
