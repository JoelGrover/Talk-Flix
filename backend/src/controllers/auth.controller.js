import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export async function signup(req,res) {
    const {email,password,fullName} = req.body;
    try{
        if(!email||!password||!fullName){
            return res.status(400).json({message:"All fields are required!"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long!"});
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists!"});
        }
        const idx = Math.floor(Math.random()*100)+1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePic:randomAvatar,
        });
        // to create user in stream 
       try{
         await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
        });
        console.log(`stream user created fro ${newUser.fullName} with id ${newUser._id}`);
       }catch(err){
            console.error("Error creating/updating Stream user:", err);
            throw new Error("Failed to create or update Stream user");
       }

        

        const token =jwt.sign(
            {userId:newUser._id},
            process.env.JWT_SECRET_KEY, 
            {expiresIn:"7d"} 
            
        )

        res.cookie("jwt",token,{
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevents XSS client-side JavaScript from accessing the cookie
            sameSite:"Strict", //prevents CSRF attacks
            secure : process.env.NODE_ENV === "production"
            });

        res.status(201).json({success:true , user: newUser});

    }catch(err){
        console.error("Error during signup:", err);
        return res.status(500).json({message:"Internal server error!"});
    }
}
export async function login(req,res) {
    try{
        const {email , password } = req.body;
        if(!email || !password){
            return res.status(401).json({message:"All feilds are required!!"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Credentials!"});
        }
        const isPasswordCorrect = await user.macthPassword(password);
        if(!isPasswordCorrect){
            return res.status(401).json({message:"Invalid Password! or email!"});
        }

        const token =jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET_KEY, 
            {expiresIn:"7d"} 
            
        )

        res.cookie("jwt",token,{
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevents XSS client-side JavaScript from accessing the cookie
            sameSite:"Strict", //prevents CSRF attacks
            secure : process.env.NODE_ENV === "production"
        });
        res.status(200).json({success:true , user});

    }catch (err){
        console.error("Error during login:", err);
        return res.status(500).json({message:"Internal server error!"});
    }
}
export async function logout(req,res) {
    try{
        res.clearCookie("jwt",{
            httpOnly: true,
            sameSite:"Strict",
            secure : process.env.NODE_ENV === "production"
        });
        res.status(200).json({success:true , message:"Logged out successfully!"});
    }catch(err){
        console.error("Error during logout:", err);
        return res.status(500).json({message:"Internal server error!"});
    }
}

export async function onboard(req,res){
try{
    const userId = req.user._id;
    const {fullName,bio,nativeLanguage,learningLanguage,location} = req.body;
    if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
        return res.status(400).json({message:"All fields are required!",
            missingFields:{
            fullName: !fullName,
            bio: !bio,
            nativeLanguage: !nativeLanguage,
            learningLanguage: !learningLanguage,
            location: !location
        } 
        });
    
    }  
   const updatedUser =  await User.findByIdAndUpdate(userId,{
        fullName,    
        bio,    
        nativeLanguage,    
        learningLanguage,    
        location, 
        isOnboarded:true   
    }, {new:true});
    if(!updatedUser){
        return res.status(404).json({message:"User not found!"});
    }
    // update user info in stream
    try{
        await upsertStreamUser({
            id:updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
        })
    }catch(streamError){
        console.error("Error updating Stream user during onboarding:", streamError);
        return res.status(500).json({message:"Failed to update Stream user!"});
    }
    res.status(200).json({success:true, user:updatedUser});
}catch(err){
    console.error("Error during onboarding:", err);
    return res.status(500).json({message:"Internal server error!"});
}
}