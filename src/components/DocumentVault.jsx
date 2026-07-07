import React, { useState, useEffect } from "react";
import { stripMetadata } from "../utils/imageUtils";
import { verifyDocumentCompleteness } from "../utils/groqService";
import { 
  uploadVaultDocumentFile, 
  createVaultDocumentRecord, 
  listenToVaultDocuments 
} from "../utils/firebaseService";
import { 
  Upload, 
  ShieldCheck, 
  EyeOff, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Clock, 
  Grid,
  Sparkles
} from "lucide-react";

export default function DocumentVault({ user }) {
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [strippedSize, setStrippedSize] = useState(0);
  const [strippedBlob, setStrippedBlob] = useState(null);
  const [strippedDataUrl, setStrippedDataUrl] = useState("");
  
  const [status, setStatus] = useState("idle"); // idle, processing, complete
  const [statusMsg, setStatusMsg] = useState("");
  
  const [documents, setDocuments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Subscribe to user documents in real-time
  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToVaultDocuments(user.uid, (list) => {
      setDocuments(list);
      setLoadingList(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file of the document (JPEG/PNG) for visual analysis.");
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("processing");
    setStatusMsg("Stripping GPS and EXIF headers...");

    try {
      const result = await stripMetadata(selectedFile);
      setStrippedBlob(result.file);
      setStrippedDataUrl(result.dataUrl);
      setStrippedSize(result.strippedSize);
      setStatus("idle");
    } catch (e) {
      console.error(e);
      alert("Metadata clean failed. Please try a different photo.");
      setStatus("idle");
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!docType || !strippedBlob) return;

    setStatus("processing");
    setStatusMsg("Uploading document to Firebase Storage...");

    try {
      // 1. Upload stripped image to Storage
      const fileUrl = await uploadVaultDocumentFile(user.uid, docType, strippedBlob, strippedDataUrl);

      setStatusMsg("Analyzing document readability & completeness...");
      // 2. Query Groq Llama 3.2 Vision API for layout format completeness checks
      const visionResult = await verifyDocumentCompleteness(strippedDataUrl, docType, file.name);

      // 3. Write metadata to Firestore
      const documentRecord = {
        uid: user.uid,
        docType: docType,
        fileURL: fileUrl,
        status: visionResult.status,
        reason: visionResult.reason,
        uploadedAt: Date.now()
      };

      await createVaultDocumentRecord(documentRecord);
      
      // Reset form
      setDocType("");
      setFile(null);
      setStrippedBlob(null);
      setStrippedDataUrl("");
      setStatus("idle");
    } catch (err) {
      console.error(err);
      alert("Error occurred during document verification.");
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-8 font-sans text-sm pb-10">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          🔒 Secure Document Vault
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Securely archive your certificates. We strip location trackers in your browser, 
          then check document layout completeness with Groq Vision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Upload Column */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-base">
            Upload Document
          </h3>

          <form onSubmit={handleUploadAndAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Document Classification
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              >
                <option value="">Choose Document Type...</option>
                <option value="Aadhaar Card">Aadhaar Identity Card</option>
                <option value="Income Certificate">Annual Income Certificate</option>
                <option value="Land Record (Patta/Patrak)">Land Ownership / Patta record</option>
                <option value="Ration Card">Priority Household Ration Card</option>
                <option value="Address Proof">Address Proof (Electricity Bill / Voter ID)</option>
              </select>
            </div>

            {/* File Area */}
            {!file ? (
              <div className="border-2 border-dashed border-gray-200 hover:border-saffron rounded-xl p-6 text-center cursor-pointer relative bg-gray-50 bg-opacity-30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <span className="block font-bold text-gray-700 text-xs">Choose File</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">JPEG/PNG formats</span>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 truncate max-w-[120px]">{file.name}</span>
                  <button 
                    onClick={() => { setFile(null); setStrippedBlob(null); }}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>

                {/* Exif details */}
                <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] rounded-lg border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> EXIF GPS Scrubbed
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Original Size:</span>
                    <span>{Math.round(originalSize / 1024)} KB</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Cleaned Size:</span>
                    <span>{Math.round(strippedSize / 1024)} KB</span>
                  </div>
                </div>
              </div>
            )}

            {status === "processing" ? (
              <div className="p-3 border rounded-xl flex items-center justify-center gap-2 bg-orange-50 bg-opacity-35 border-orange-100">
                <Loader2 className="w-4 h-4 text-saffron animate-spin" />
                <span className="text-[10px] font-bold text-saffron-dark">{statusMsg}</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!docType || !strippedBlob}
                className="w-full py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Upload & Verify Layout
              </button>
            )}
          </form>

          {/* Vision limit warning */}
          <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-2 border">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-gray-500 leading-normal font-sans">
              <strong>Verification Limit</strong>: Visual checks only review document format readability and incomplete fields. 
              Authenticity or forgery checks are not performed.
            </div>
          </div>
        </div>

        {/* Documents Grid Column */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
            <Grid className="w-5 h-5 text-saffron" /> Your Archived Certificates
          </h3>

          {loadingList ? (
            <div className="flex items-center gap-2 justify-center py-10">
              <Loader2 className="w-5 h-5 text-saffron animate-spin" />
              <span className="text-xs text-gray-400">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white p-8 border rounded-2xl text-center text-gray-400">
              Your Document Vault is empty. Upload documents to verify and store.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const isComplete = doc.status === "complete";
                const dateStr = new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <div 
                    key={doc.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-saffron hover:shadow-md transition duration-300"
                  >
                    {/* Thumbnail preview */}
                    <div className="h-32 bg-gray-100 flex justify-center items-center overflow-hidden border-b">
                      <img src={doc.fileURL} alt={doc.docType} className="object-cover w-full h-full" />
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Uploaded {dateStr}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-gray-800 text-sm">
                        {doc.docType}
                      </h4>

                      {/* Status Badges */}
                      <div className="space-y-1">
                        <div className={`p-2 rounded-xl border flex items-start gap-1.5 text-[10px] leading-relaxed font-bold ${
                          isComplete 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                            : "bg-red-50 border-red-100 text-red-800"
                        }`}>
                          {isComplete ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>✅ Looks complete</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                              <span>{doc.reason || "Format check needed."}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
