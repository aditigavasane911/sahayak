import React, { useState, useEffect } from "react";
import { fetchSchemes } from "../utils/firebaseService";
import { CheckSquare, Square, Download, Landmark, FileText, ChevronRight } from "lucide-react";

export default function ChecklistScreen({ defaultSchemeId }) {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Agriculture"); // Priority 4 Tab

  // Track check state for documents: { [schemeId]: { [docId]: boolean } }
  const [checkedDocs, setCheckedDocs] = useState({});

  const categories = ["Agriculture", "Health", "Construction/Housing", "Loans", "Employment"];

  useEffect(() => {
    fetchSchemes().then(data => {
      setSchemes(data);
      
      if (defaultSchemeId) {
        const found = data.find(s => s.id === defaultSchemeId);
        if (found) {
          setSelectedScheme(found);
          if (found.category) {
            setActiveCategory(found.category); // Auto-focus matching category tab
          }
        }
      } else if (data.length > 0) {
        // Find first scheme matching default Agriculture category
        const initial = data.find(s => s.category === "Agriculture") || data[0];
        setSelectedScheme(initial);
      }
    });

    try {
      const stored = localStorage.getItem("sahayak_checked_docs");
      if (stored) setCheckedDocs(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load doc checkboxes", e);
    }
  }, [defaultSchemeId]);

  // Handle activeCategory changes to auto-select first filtered scheme
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const filtered = schemes.filter(s => s.category === cat);
    if (filtered.length > 0) {
      setSelectedScheme(filtered[0]);
    } else {
      setSelectedScheme(null);
    }
  };

  const toggleDoc = (schemeId, docId) => {
    const nextState = {
      ...checkedDocs,
      [schemeId]: {
        ...(checkedDocs[schemeId] || {}),
        [docId]: !(checkedDocs[schemeId]?.[docId] || false)
      }
    };
    setCheckedDocs(nextState);
    localStorage.setItem("sahayak_checked_docs", JSON.stringify(nextState));
  };

  const getCompletionPercentage = (scheme) => {
    if (!scheme || !scheme.documents) return 0;
    const items = scheme.documents;
    const completed = items.filter(d => checkedDocs[scheme.id]?.[d.id]).length;
    return Math.round((completed / items.length) * 100);
  };

  const filteredSchemes = schemes.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 font-sans text-sm">
      <div className="text-center">
        <h2 className="text-3xl font-semibold font-serif text-gray-900">
          📋 Document Readiness Checklist
        </h2>
        <p className="text-gray-500 text-xs mt-2 max-w-lg mx-auto">
          Prepare your documentation before applying online or visiting the municipal office. 
          Tick off what you have.
        </p>
      </div>

      {/* Category Tabs at the top (Priority 4 Feature) */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-1 justify-center max-w-2xl mx-auto shrink-0 select-none">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                isSelected 
                  ? "bg-saffron text-white shadow-sm" 
                  : "bg-white text-gray-500 hover:text-gray-800 hover:bg-orange-50 bg-opacity-35"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
        {/* Schemes selection sidebar */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-2 px-2">
            Schemes in {activeCategory}
          </h3>
          <div className="space-y-1">
            {filteredSchemes.length === 0 ? (
              <p className="text-xs text-gray-400 p-2 italic">No schemes in this category yet.</p>
            ) : (
              filteredSchemes.map((scheme) => {
                const isSelected = selectedScheme?.id === scheme.id;
                const percent = getCompletionPercentage(scheme);
                return (
                  <button
                    key={scheme.id}
                    onClick={() => setSelectedScheme(scheme)}
                    className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-orange-50 border-l-4 border-saffron"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="font-bold text-xs text-gray-900 line-clamp-1">
                      {scheme.name}
                    </span>
                    
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-saffron h-1.5 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>Readiness: {percent}%</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Documents requirement details */}
        <div className="md:col-span-2 space-y-4">
          {selectedScheme ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 animate-fade-in">
              <div className="border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400">
                  <Landmark className="w-3.5 h-3.5" /> Scheme Prerequisites ({selectedScheme.category})
                </div>
                <h3 className="font-bold font-serif text-xl text-gray-900">
                  {selectedScheme.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {selectedScheme.description}
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div className="bg-orange-50 bg-opacity-30 border border-orange-100 p-4 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Verification Criteria
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedScheme.eligibility.criteria}
                </p>
              </div>

              {/* Documents Checklist */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider mb-1">
                  Documents Needed
                </h4>
                
                <div className="divide-y divide-gray-50">
                  {selectedScheme.documents.map((doc) => {
                    const isChecked = checkedDocs[selectedScheme.id]?.[doc.id] || false;
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => toggleDoc(selectedScheme.id, doc.id)}
                        className="py-3.5 flex items-start gap-3.5 cursor-pointer group select-none"
                      >
                        <button className="mt-0.5 text-saffron shrink-0 transition group-hover:scale-105">
                          {isChecked ? (
                            <CheckSquare className="w-5.5 h-5.5 fill-orange-50 text-saffron" />
                          ) : (
                            <Square className="w-5.5 h-5.5 text-gray-300 hover:text-saffron" />
                          )}
                        </button>
                        
                        <div className="space-y-0.5">
                          <span className={`text-sm font-semibold transition ${
                            isChecked ? "text-gray-400 line-through" : "text-gray-800"
                          }`}>
                            {doc.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              doc.required 
                                ? "bg-red-50 text-red-600" 
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {doc.required ? "Mandatory" : "Optional"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Requires self-attestation
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs text-gray-400">
                    Documents Ready: {selectedScheme.documents.filter(d => checkedDocs[selectedScheme.id]?.[d.id]).length} of {selectedScheme.documents.length}
                  </span>
                </div>

                {selectedScheme.officialLink && (
                  <a
                    href={selectedScheme.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
                  >
                    Apply on Official Portal
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              Please select a scheme from the left sidebar to view document prerequisites.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
