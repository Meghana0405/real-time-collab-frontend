import { useState } from "react";

interface Props {

  onClose: () => void;

  onCreate: (
    title: string,
    content: string
  ) => void;

}

function CreateDocumentModal({

  onClose,
  onCreate

}: Props) {

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  return (

    <div style={overlayStyle}>

      <div style={modalStyle}>

        <h3>Create New Document 📄</h3>

        <input

          placeholder="Document title"

          value={title}

          onChange={(e) =>
            setTitle(e.target.value)
          }

          style={inputStyle}

        />

        <textarea

          placeholder="Initial content (optional)"

          value={content}

          onChange={(e) =>
            setContent(e.target.value)
          }

          rows={5}

          style={inputStyle}

        />

        <div>

          <button
            onClick={() =>
              onCreate(title, content)
            }
          >

            Create

          </button>

          <button
            onClick={onClose}
          >

            Cancel

          </button>

        </div>

      </div>

    </div>

  );

}

export default CreateDocumentModal;



const overlayStyle = {

  position: "fixed" as const,

  top: 0,

  left: 0,

  width: "100%",

  height: "100%",

  background: "rgba(0,0,0,0.4)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center"

};

const modalStyle = {

  background: "white",

  padding: "20px",

  borderRadius: "8px",

  width: "300px"

};

const inputStyle = {

  width: "100%",

  marginBottom: "10px",

  padding: "6px"

};