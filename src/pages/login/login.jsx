import React from "react";
import "./login.css";
import assets from "../../assets/assets.js";
import { useState } from "react";
import {signup,login} from "../../config/firebase.js";

const Login = () => {

    const [currstate, setCurrstate] = useState("Sign up");
    const[username,setUsername]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");   


    const onSubmit=async(e)=>{
        e.preventDefault();  
        if(currstate==="Sign up"){
            await signup(username,email,password);
        }else{
            await login(email,password);
        }

    }

    return (
        <div className="login">
            <img src={assets.logo_big} alt="" className="logo" />
            <form onSubmit={onSubmit} className="login-form">

                <h2>{currstate}</h2>
                    {currstate==="Sign up" ? <input  onChange={(e)=>setUsername(e.target.value)} value={username} type="text" placeholder="User Name" className="form-input" required/> : null}
                    <input  onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder="Email Address" className="form-input" required/>
                    <input  onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder="Password" className="form-input" required/>
                    <button type="submit">{currstate === "Sign up"? "Create account":"Login"}</button>

                    <div className="login-term">
                        <input type="checkbox"/>
                        <p>I agree to the Terms & Conditions</p>
                    </div>
                    <div className="login-forgot">
                        {
                        currstate==="Sign up" ? <p className="login-toggle">Already Have a account <span onClick={()=>setCurrstate("Login")}>Click here</span></p> 
                        :<p className="login-toggle">Create an account <span onClick={()=>setCurrstate("Sign up")}>Click here</span></p>
                        }
                        
                    </div>
            </form>
        </div>
    );
};

export default Login;