import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useQuill } from "react-quilljs";
import { api } from "../api/axios";
import Quill from "quill";
import QuillCursors from "quill-cursors";

import "quill/dist/quill.snow.css";

Quill.register("modules/cursors", QuillCursors);

function Editor() {
  const { id } = useParams();

  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const [typingUser, setTypingUser] = useState("");

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ header: [1, 2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"]
      ],
      cursors: true
    }
  });

  // 🎨 Cursor colors
  const colors = ["red", "green", "blue", "purple", "orange"];
  const getColor = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
    return colors[h % colors.length];
  };

  // SOCKET
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  // LOAD DOC
  useEffect(() => {
    if (!id || !quill) return;

    const load = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        const data = res.data;

        if (data?.content?.ops) {
          quill.setContents(data.content);
        } else {
          quill.setText("Start typing...");
        }

        setIsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id, quill]);

  // COLLAB
  useEffect(() => {
    if (!quill || !id || !isLoaded) return;

    const userId =
      localStorage.getItem("userId") || `user-${Math.random()}`;

    socket.emit("join-document", { documentId: id, userId });

    const handleChange = (delta: any, _old: any, source: string) => {
      if (source !== "user") return;

      socket.emit("send-changes", { documentId: id, delta });
      socket.emit("typing", { documentId: id, userId });
    };

    quill.on("text-change", handleChange);

    socket.on("receive-changes", (delta: any) => {
      quill.updateContents(delta, "silent");
    });

    socket.on("active-users", (users: string[]) => {
      setActiveUsers(users);
    });

    socket.on("typing", (u: string) => {
      setTypingUser(u);
      setTimeout(() => setTypingUser(""), 1500);
    });

    // ✅ FIXED CURSOR MODULE
    const cursorModule: any = quill.getModule("cursors");

    quill.on("selection-change", (range: any) => {
      if (range) {
        socket.emit("cursor-change", {
          documentId: id,
          userId,
          range
        });
      }
    });

    socket.on("receive-cursor", ({ userId, range }) => {
      if (!cursorModule) return;

      cursorModule.createCursor?.(
        userId,
        userId,
        getColor(userId)
      );

      cursorModule.moveCursor?.(userId, range);
    });

    return () => {
      quill.off("text-change", handleChange);
      socket.off("receive-changes");
      socket.off("active-users");
      socket.off("typing");
      socket.off("receive-cursor");
    };
  }, [quill, id, isLoaded]);

  // AUTO SAVE
  useEffect(() => {
    if (!quill || !id) return;

    const t = setInterval(() => {
      const content = quill.getContents();
      api.put(`/documents/${id}`, { content }).catch(console.error);
    }, 3000);

    return () => clearInterval(t);
  }, [quill, id]);

  // INVITE
  const sendInvite = async () => {
    if (!inviteEmail.includes("@")) {
      alert("Invalid email");
      return;
    }

    await api.post(`/documents/${id}/invite`, {
      email: inviteEmail,
      role
    });

    alert("Invite sent 📧");
    setInviteEmail("");
  };

  // COMMENTS
  const addComment = async () => {
    if (!comment) return;

    const res = await api.post(`/documents/${id}/comments`, {
      text: comment,
      range: { index: 0, length: 0 }
    });

    setComments((p) => [...p, res.data]);
    setComment("");
  };

  // HISTORY
  const loadHistory = async () => {
    const res = await api.get(`/documents/${id}/history`);
    setHistory(res.data);
    setShowHistory(true);
  };

  const restoreVersion = async (versionId: string) => {
    const res = await api.post(
      `/documents/${id}/restore/${versionId}`
    );

    if (quill && res.data?.content) {
      quill.setContents(res.data.content);
    }

    alert("Version restored ✅");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Collaborative Editor 📝</h2>

      <div>
        <strong>Active Users:</strong>
        {activeUsers.map((u, i) => (
          <span key={i} style={{ marginLeft: 10 }}>
            👤 {u}
          </span>
        ))}
      </div>

      {typingUser && (
        <p style={{ color: "gray" }}>
          ✍️ {typingUser} is typing...
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>Invite 📧</h3>
        <input
          placeholder="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button onClick={sendInvite}>Send</button>
      </div>

      <div style={{ marginTop: 15 }}>
        <button onClick={loadHistory}>
          🕒 View History
        </button>
      </div>

      {showHistory && (
        <div style={{ marginTop: 10 }}>
          <h3>Version History</h3>
          <ul>
            {history.map((v: any) => (
              <li key={v._id}>
                {new Date(v.createdAt).toLocaleString()}
                <button
                  onClick={() => restoreVersion(v._id)}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        ref={quillRef}
        style={{
          height: 400,
          marginTop: 20,
          background: "#fff"
        }}
      />

      <div style={{ marginTop: 20 }}>
        <h3>Comments 💬</h3>
        <input
          placeholder="Add comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={addComment}>Add</button>

        <ul>
          {comments.map((c, i) => (
            <li key={i}>
              <b>{c.userId?.email}</b>: {c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Editor;