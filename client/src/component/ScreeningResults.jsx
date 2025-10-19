import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { jsPDF } from "jspdf";

const ScreeningResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { aiResult, formData } = location.state || {};

  if (!aiResult || !Array.isArray(aiResult.therapy_goals) || !Array.isArray(aiResult.activities)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h1>
          <p className="text-gray-700">
            Could not retrieve valid analysis results.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Go Back to Form
          </Link>
        </div>
      </div>
    );
  }

  const { therapy_goals, activities, focus_areas } = aiResult;

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text("Screening Results & Recommendations", 10, y);
    y += 10;

    const intro = "Personalized therapy goals and activities for your child's development";
    const introLines = doc.splitTextToSize(intro, pageWidth - 20);
    doc.text(introLines, 10, y);
    y += introLines.length * 6;

    if (formData) {
      doc.setFontSize(14);
      doc.text("Child's Information:", 10, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Age: ${formData.age}`, 12, y); y += 7;
      doc.text(`Eye Contact: ${formData.eyeContact}`, 12, y); y += 7;
      doc.text(`Speech Level: ${formData.speechLevel}`, 12, y); y += 7;
      doc.text(`Social Response: ${formData.socialResponse}`, 12, y); y += 7;
      doc.text(`Sensory Reactions: ${formData.sensoryReactions.join(", ")}`, 12, y); y += 10;
    }

    if (focus_areas.length > 0) {
      doc.setFontSize(14);
      doc.text("Key Focus Areas:", 10, y);
      y += 10;
      focus_areas.forEach((area, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${area}`, pageWidth - 20);
        doc.setFontSize(12);
        doc.text(lines, 10, y);
        y += lines.length * 6;
      });
      y += 5;
    }


    doc.setFontSize(14);
    doc.text("Therapy Goals:", 10, y);
    y += 10;

    therapy_goals.forEach((goal, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${goal}`, pageWidth - 20);
      doc.setFontSize(12);
      doc.text(lines, 10, y);
      y += lines.length * 6;
    });

    y += 5;

    doc.setFontSize(14);
    doc.text("Recommended Activities:", 10, y);
    y += 10;

    activities.forEach((activity, i) => {
      const titleLines = doc.splitTextToSize(`${i + 1}. ${activity.title}`, pageWidth - 20);
      doc.setFontSize(12);
      doc.text(titleLines, 10, y);
      y += titleLines.length * 6;

      const descLines = doc.splitTextToSize(activity.description, pageWidth - 20);
      doc.setFontSize(10);
      doc.text(descLines, 12, y);
      y += descLines.length * 5;

      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("screening_results.pdf");
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">

        <div className="bg-gray-50 p-6 rounded-xl shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Screening Results & Recommendations
          </h1>
          <p className="text-gray-600 mt-2">
            Personalized therapy goals and activities for your child's development
          </p>
        </div>
        {/*Focus Areas */}

        <div className="bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Focus Areas
          </h2>
          <ul className="space-y-3 text-gray-800">
            {focus_areas.map((area, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-blue-100 rounded-lg shadow-sm border border-blue-200">
                <div className="w-7 h-7 flex items-center justify-center bg-blue-200 text-blue-700 font-semibold rounded-full">
                  {i + 1}
                </div>
                <span className="text-gray-900">{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Therapy Goals */}
        <div className="bg-orange-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Therapy Goals
          </h2>
          <ul className="space-y-3 text-gray-800">
            {therapy_goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-700 font-semibold rounded-full">
                  {i + 1}
                </div>
                <span className="text-gray-900">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activities */}
        <div className="bg-orange-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Recommended Activities
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activities.map((activity, i) => (
              <div key={i} className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                <p className="text-gray-700 mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => navigate("/")} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
            Check Again
          </button>
          <button onClick={downloadPDF} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningResults;
