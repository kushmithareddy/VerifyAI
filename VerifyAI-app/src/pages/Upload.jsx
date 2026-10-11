import React, { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select an image first.");
      return;
    }
    if (!pin || pin.length !== 6) {
      setError("Enter a valid 6-digit PIN.");
      return;
    }

    // ---------------------------------------------------------
    // 1️⃣ VERIFY PIN FIRST
    // ---------------------------------------------------------
    const verifyResponse = await fetch("http://localhost:5000/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      setError("❌ PIN invalid or expired.");
      return;
    }

    // ---------------------------------------------------------
    // 2️⃣ PIN is valid → Upload Image
    // ---------------------------------------------------------
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    const uploadResponse = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const uploadedHtml = await uploadResponse.text();

    setResult(uploadedHtml);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verify AI — Upload</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Image</label>
        <input type="file" accept="image/*" onChange={handleFile} />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Enter 6-digit PIN</label>
        <input
          type="text"
          maxLength="6"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="123456"
        />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        Upload & Analyze
      </button>

      {result && (
        <div className="bg-white shadow mt-6 p-4 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <div dangerouslySetInnerHTML={{ __html: result }}></div>
        </div>
      )}
    </div>
  );
}
