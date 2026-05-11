const User = require ('../models/User');
const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});


const login = async (req,res) =>{
    const {email,password} = req.body;
    const user = await User.findUserByEmail(email);
    if(!user){
        return res.status(404).json({message:"utilisateur non trouvé"})
    }
    const ismatchPassword = await bcrypt.compare(password,user.password);
    if(!ismatchPassword){
        return res.status(401).json({message:"mot de passe incorrect"})
    }
    const token= jwt.sign(
        {
            userId:user.id,
            email:user.email,
            nom:user.nom,
            role:user.role
        },
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
    )
    return res.status(200).json({
        userId:user.id,
        role:user.role,
        nom:user.nom,
        token
    })
}
module.exports={
    login
}