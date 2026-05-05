import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { getDocuments } from "../api/documentApi";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import CreateDocumentModal from "../components/CreateDocumentModal";

interface DocumentType {
  _id: string;
  title: string;
  updatedAt: string;
}

function Dashboard() {

  const token = useAuthStore((state) => state.token);

  const [documents, setDocuments] =
    useState<DocumentType[]>([]);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const navigate = useNavigate();


  // Load documents
  useEffect(() => {

    if (!token) return;

    getDocuments()
      .then(setDocuments)
      .catch(() =>
        console.log("Error fetching documents")
      );

  }, [token]);


  // Delete document
  const deleteDocument = async (id: string) => {

    if (!token) return;

    const confirmDelete =
      window.confirm("Delete this document?");

    if (!confirmDelete) return;

    try {

      await api.delete(`/documents/${id}`);

      // Remove deleted document instantly from UI
      setDocuments(prev =>
        prev.filter(doc => doc._id !== id)
      );

    }

    catch {

      console.log("Delete failed");

    }

  };

  // Create document
  const createDocument = async (title: string) => {

    if (!token) return;

    try {

      const res = await api.post(
        "/documents",
        { title: title || "Untitled" }
      );

      const doc = res.data;

      setDocuments(prev => [doc, ...prev]);
      setShowCreateModal(false);
      navigate(`/editor/${doc._id}`);

    }

    catch {

      console.log("Create failed");

    }

  };


  return (

    <div style={{ padding: "20px" }}>

      <h2>Your Documents 📄</h2>

      <button
        style={{ marginBottom: 20 }}
        onClick={() => setShowCreateModal(true)}
      >
        Create Document
      </button>

      {showCreateModal && (
        <CreateDocumentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(title) => createDocument(title)}
        />
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>

        {documents.map(doc => (

          <li
            key={doc._id}
            style={{
              marginBottom: 20
            }}
          >

            {/* Document title (click opens editor) */}
            <div
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "18px"
              }}
              onClick={() =>
                navigate(`/editor/${doc._id}`)
              }
            >
              {doc.title}
            </div>


            {/* Last edited timestamp */}
            <small style={{ color: "gray" }}>
              Last edited:
              {" "}
              {new Date(
                doc.updatedAt
              ).toLocaleString()}
            </small>


            <br />


            {/* Delete button */}
            <button
              style={{ marginTop: 6 }}
              onClick={() =>
                deleteDocument(doc._id)
              }
            >
              Delete 🗑️
            </button>

          </li>

        ))}

      </ul>

    </div>

  );

}

export default Dashboard;
