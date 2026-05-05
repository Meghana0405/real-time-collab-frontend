import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api/axios";

function Invite(){

const { token } = useParams();

const navigate = useNavigate();

useEffect(()=>{

api.get(`/invite/${token}`)
.then(res=> res.data)
.then(data=>{

navigate(`/editor/${data.documentId}`);

});

},[]);

return <h2>Joining document...</h2>;

}

export default Invite;