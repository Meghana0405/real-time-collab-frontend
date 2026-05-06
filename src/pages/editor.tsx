import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  const [typingUser, setTypingUser] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const saveTimeout = useRef<any>(null);
  const typingTimeout = useRef<any>(null);

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

    for (let i = 0; i < id.length; i++) {
      h += id.charCodeAt(i);
    }

    return colors[h % colors.length];
  };

  // ================= LOAD DOCUMENT =================
  useEffect(() => {
    if (!id || !quill) return;

    const loadDocument = async () => {
      try {
        const res = await api.get(`/documents/${id}`);

        if (res.data?.content?.ops) {
          quill.setContents(res.data.content);
        } else {
          quill.setText("Start typing...");
        }

        setIsLoaded(true);

      } catch (err) {
        console.error("❌ Load Error:", err);
      }
    };

    loadDocument();

  }, [id, quill]);

  // ================= SEND INVITE =================
  const sendInvite = async () => {

    if (!inviteEmail) {
      alert("Enter email first 📧");
      return;
    }

    try {

      const res = await api.post(`/documents/${id}/invite`, {
        email: inviteEmail,
        role
      });

      console.log("✅ Invite Success:", res.data);

      alert("Invite sent successfully ✅");

      setInviteEmail("");

    } catch (err: any) {

      console.log(
        "❌ Invite Error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        "Failed to send invite ❌"
      );
    }
  };

  // ================= REALTIME =================
  useEffect(() => {

    if (!quill || !id || !isLoaded) return;

    const userId =
      localStorage.getItem("userId") ||
      `user-${Math.random()}`;

    socket.emit("join-document", {
      documentId: id,
      userId
    });

    // ================= TEXT CHANGE =================
    const handleChange = (
      delta: any,
      _old: any,
      source: string
    ) => {

      if (source !== "user") return;

      socket.emit("send-changes", {
        documentId: id,
        delta
      });

      // typing debounce
      clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        socket.emit("typing", {
          documentId: id,
          userId
        });
      }, 300);

      // autosave debounce
      clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        try {

          const content = quill.getContents();

          await api.put(`/documents/${id}`, {
            content
          });

        } catch (err) {

          console.error("❌ Save Error:", err);

        }
      }, 1000);
    };

    quill.on("text-change", handleChange);

    // ================= RECEIVE CHANGES =================
    const receiveHandler = (delta: any) => {

      if (!quill) return;

      quill.updateContents(delta, "api");
    };

    socket.on("receive-changes", receiveHandler);

    // ================= ACTIVE USERS =================
    socket.on("active-users", setActiveUsers);

    // ================= TYPING =================
    socket.on("typing", (u: string) => {

      setTypingUser(u);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);

    });

    // ================= CURSORS =================
    const cursorModule: any =
      quill.getModule("cursors");

    const selectionHandler = (range: any) => {

      if (!range) return;

      socket.emit("cursor-change", {
        documentId: id,
        userId,
        range
      });
    };

    quill.on(
      "selection-change",
      selectionHandler
    );

    const cursorHandler = ({
      userId,
      range
    }: any) => {

      if (!cursorModule) return;

      cursorModule.createCursor(
        userId,
        userId,
        getColor(userId)
      );

      cursorModule.moveCursor(
        userId,
        range
      );
    };

    socket.on("receive-cursor", cursorHandler);

    // ================= CLEANUP =================
    return () => {

      quill.off("text-change", handleChange);

      quill.off(
        "selection-change",
        selectionHandler
      );

      socket.off(
        "receive-changes",
        receiveHandler
      );

      socket.off("active-users");

      socket.off("typing");

      socket.off(
        "receive-cursor",
        cursorHandler
      );
    };

  }, [quill, id, isLoaded]);

  return (
    <div style={{ padding: 20 }}>

      <h2>
        Collaborative Editor 📝
      </h2>

      {/* Invite UI */}
      <div style={{ marginBottom: 15 }}>

        <input
          type="email"
          placeholder="Enter email"
          value={inviteEmail}
          onChange={(e) =>
            setInviteEmail(e.target.value)
          }
          style={{
            padding: 8,
            marginRight: 10
          }}
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={{
            padding: 8,
            marginRight: 10
          }}
        >
          <option value="viewer">
            Viewer
          </option>

          <option value="editor">
            Editor
          </option>
        </select>

        <button onClick={sendInvite}>
          Send Invite 📩
        </button>

      </div>

      {/* Active users */}
      <div>

        <strong>
          Active Users:
        </strong>

        {activeUsers.map((u, i) => (

          <span
            key={i}
            style={{ marginLeft: 10 }}
          >
            👤 {u}
          </span>

        ))}

      </div>

      {/* Typing indicator */}
      {typingUser && (

        <p style={{ color: "gray" }}>
          ✍️ {typingUser} is typing...
        </p>

      )}

      {/* Editor */}
      <div
        ref={quillRef}
        style={{
          height: 400,
          marginTop: 20,
          background: "#132e3c"
        }}
      />

    </div>
  );
}

export default Editor;