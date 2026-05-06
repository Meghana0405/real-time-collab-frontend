import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api/axios";

function Invite() {

  const { token } = useParams();

  const navigate = useNavigate();

  useEffect(() => {

    const joinInvite = async () => {

      try {

        const res = await api.get(`/invite/${token}`);

        navigate(`/editor/${res.data.documentId}`);

      } catch (err) {

        console.error(err);

        alert("Invalid invite link ❌");

      }
    };

    joinInvite();

  }, [token]);

  return <h2>Joining document...</h2>;
}

export default Invite;