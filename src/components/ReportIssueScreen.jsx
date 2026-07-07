import React, { useState } from "react";
import { stripMetadata } from "../utils/imageUtils";
import { DEPARTMENTS } from "../utils/mockData";
import { classifyCivicIssue } from "../utils/groqService";
import { uploadImageFile, createComplaint, updateUserPoints } from "../utils/firebaseService";
import { 
  Upload, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  ArrowRight, 
  FileImage, 
  Trash2,
  Sparkles,
  EyeOff
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ReportIssueScreen({ user, onReportSuccess, onUpdateUser }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [strippedSize, setStrippedSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [strippedBlob, setStrippedBlob] = useState(null);
  const [strippedDataUrl, setStrippedDataUrl] = useState("");

  // Stepper states
  const [status, setStatus] = useState("idle"); // idle, stripping, classified, submitting, success
  const [privacyVerified, setPrivacyVerified] = useState(false);
  
  // Groq Vision response
  const [classification, setClassification] = useState({
    issue_type: "",
    severity: "",
    department: ""
  });

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("stripping");
    setPrivacyVerified(false);

    try {
      // Stripping EXIF metadata in browser via Canvas rendering
      const result = await stripMetadata(selectedFile);
      
      setTimeout(() => {
        setStrippedBlob(result.file);
        setStrippedDataUrl(result.dataUrl);
        setPreviewUrl(result.dataUrl);
        setStrippedSize(result.strippedSize);
        setPrivacyVerified(true);
        setStatus("stripped");
      }, 1000); // 1s visual pause for demo privacy verification
    } catch (err) {
      console.error(err);
      alert("Error processing image file.");
      setStatus("idle");
    }
  };

  const handleAnalyze = async () => {
    if (!strippedDataUrl) return;
    setStatus("analyzing");

    try {
      // Send base64 image representation to Groq Llama Vision API
      const result = await classifyCivicIssue(strippedDataUrl, description);
      setClassification(result);
      setStatus("classified");
    } catch (err) {
      console.error(err);
      setStatus("stripped");
    }
  };

  const handleSubmission = async () => {
    if (!classification.issue_type || !strippedBlob) return;
    setStatus("submitting");

    try {
      // 1. Upload stripped image to Firebase Storage / Mock Data Url
      const photoUrl = await uploadImageFile(user.uid, strippedBlob, strippedDataUrl);

      // 2. Map officer contact
      const deptDetails = DEPARTMENTS[classification.department] || DEPARTMENTS.Sanitation;

      // 3. Write complaint document to Firestore complaints collection
      const complaintData = {
        userId: user.uid,
        issueType: classification.issue_type,
        severity: classification.severity,
        department: classification.department,
        description: description,
        imageUrl: photoUrl,
        status: "Submitted",
        officerName: deptDetails.officer,
        officerContact: deptDetails.contact,
        timestamp: Date.now()
      };

      await createComplaint(complaintData);

      // 4. Update civic rewards points (+50 points)
      const newPoints = await updateUserPoints(user.uid, 50);
      onUpdateUser({ ...user, civicPoints: newPoints });

      // 5. Success Confetti burst
      confetti({
        particleCount: 150,
        spread: 75,
        origin: { y: 0.6 }
      });

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("classified");
    }
  };

  const handleReset = () => {
    setFile(null);
    setDescription("");
    setOriginalSize(0);
    setStrippedSize(0);
    setPreviewUrl("");
    setStrippedBlob(null);
    setStrippedDataUrl("");
    setPrivacyVerified(false);
    setStatus("idle");
  };

  const deptDetails = DEPARTMENTS[classification.department] || null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto px-2 font-sans text-sm">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          📸 Photo-Based Issue Reporter
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Report potholes, garbage, or broken streetlights. Our AI categorizes and routes 
          it instantly to the right officer.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {status === "idle" && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-200 hover:border-saffron rounded-2xl p-8 text-center transition cursor-pointer relative bg-gray-50 bg-opacity-30">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-orange-100 text-saffron rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Upload Photo of Issue</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, HEIC. Maximum 5MB.</p>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600">
                Optional Description
              </label>
              <textarea
                rows="3"
                placeholder="Describe the issue or exact location (e.g. Near Shiv Mandir, Sector 4 Pothole...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-saffron focus:outline-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Stripping Animation / Processing Step */}
        {status === "stripping" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs">🔒</div>
            </div>
            <div>
              <p className="font-bold text-gray-800">Stripping EXIF & GPS Metadata...</p>
              <p className="text-xs text-gray-400 mt-1">Protecting your privacy by cleaning image metadata before storage.</p>
            </div>
          </div>
        )}

        {/* Stripped Complete / Run Vision AI Action */}
        {(status === "stripped" || status === "analyzing") && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden max-h-[300px] border border-gray-100 flex justify-center bg-gray-50">
              <img src={previewUrl} alt="Stripped Preview" className="object-contain max-h-[300px]" />
              
              {/* Metadata stripped notification badge */}
              {privacyVerified && (
                <div className="absolute bottom-4 left-4 right-4 bg-emerald-900 bg-opacity-95 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs shadow-md">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Metadata Stripped for Privacy
                  </span>
                  <span className="text-[10px] text-emerald-200 bg-emerald-800 bg-opacity-40 px-2 py-0.5 rounded border border-emerald-700">
                    EXIF Cleaned
                  </span>
                </div>
              )}
            </div>

            {/* Privacy details */}
            <div className="bg-emerald-50 bg-opacity-40 border border-emerald-100 p-4 rounded-xl flex justify-between items-center text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-semibold">
                <EyeOff className="w-4 h-4" /> Size Reduced:
              </span>
              <span>
                {Math.round(originalSize / 1024)} KB ➔ {Math.round(strippedSize / 1024)} KB
              </span>
            </div>

            {status === "analyzing" ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-gray-600">Groq Llama 3.2 Vision classifying report...</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 bg-saffron text-white rounded-xl hover:bg-saffron-dark transition font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  Analyze with Vision AI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Classified Result Card & Routing Details */}
        {(status === "classified" || status === "submitting") && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
              🔎 AI Analysis & Classification
            </h3>

            {/* Analysis details grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Issue Type</span>
                <span className="block font-bold text-gray-800 mt-1">{classification.issue_type}</span>
              </div>
              <div className="bg-gray-50 border p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Severity</span>
                <span className="block font-bold text-gray-800 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    classification.severity === "High" 
                      ? "bg-red-100 text-red-800" 
                      : classification.severity === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {classification.severity}
                  </span>
                </span>
              </div>
              <div className="bg-gray-50 border p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Routed Dept</span>
                <span className="block font-bold text-gray-800 mt-1 text-xs">{classification.department}</span>
              </div>
            </div>

            {/* Routing Card */}
            {deptDetails && (
              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-saffron-dark font-serif uppercase tracking-wider">
                    ⚡ Civic Routing Officer
                  </h4>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    Assigned Ward 12
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border rounded-xl text-gray-400 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Assigned Officer</span>
                      <span className="font-bold text-gray-800 text-xs">{deptDetails.officer}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border rounded-xl text-gray-400 shadow-sm">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Contact Phone</span>
                      <span className="font-bold text-gray-800 text-xs">{deptDetails.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submission triggers */}
            <div className="flex gap-3 pt-2">
              <button
                disabled={status === "submitting"}
                onClick={handleReset}
                className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition font-semibold"
              >
                Reset
              </button>
              <button
                disabled={status === "submitting"}
                onClick={handleSubmission}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {status === "submitting" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Filing Report...
                  </>
                ) : (
                  <>
                    File Official Report (+50 Points)
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success screen */}
        {status === "success" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
              🎉
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-xl text-gray-900">Complaint Lodged Successfully!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Your report has been written directly to Firestore database. Tracks real-time progress on "My Complaints".
              </p>
            </div>

            <div className="bg-orange-50 bg-opacity-70 border border-orange-100 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-xs font-semibold text-orange-800">
              <Sparkles className="w-4 h-4 text-saffron" /> Earned +50 Civic Points!
            </div>

            <button
              onClick={onReportSuccess}
              className="px-6 py-2.5 bg-saffron text-white rounded-xl text-xs font-semibold hover:bg-saffron-dark transition shadow-sm"
            >
              Track Complaints ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
