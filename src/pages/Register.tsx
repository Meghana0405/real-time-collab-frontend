import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

function Register() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();


  const handleRegister = async () => {

    try {

      const res = await api.post(
        "/register",
        { email, password }
      );

      const data = res.data;

      alert(data.message);

      if(res.status === 200)
        navigate("/");

    }

    catch (error: any) {

      alert(error.response?.data?.message || "Registration failed");

    }

  };


  return(

    <div style={{padding:20}}>

      <h2>Register 👤</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleRegister}>
        Register
      </button>

    </div>

  );

}

export default Register;