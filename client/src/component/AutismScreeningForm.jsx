import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EYE_CONTACT_OPTIONS = ['Poor', 'Average', 'Good'];
const SPEECH_LEVEL_OPTIONS = ['Non-verbal', 'Limited words', 'Full sentences'];
const SOCIAL_RESPONSE_OPTIONS = ['Rarely responds', 'Sometimes responds', 'Often responds'];
const SENSORY_OPTIONS = [
  'Sensitive to sound',
  'Sensitive to touch',
  'Sensitive to light',
  'No noticeable sensory issues',
];

const AutismScreeningForm = () => {
  const [age, setAge] = useState('');
  const [eyeContact, setEyeContact] = useState('');
  const [speechLevel, setSpeechLevel] = useState('');
  const [socialResponse, setSocialResponse] = useState('');
  const [sensoryReactions, setSensoryReactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCheckboxChange = (option) => {
    setSensoryReactions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!age || !eyeContact || !speechLevel || !socialResponse || sensoryReactions.length === 0) {
      setError("Please fill in all fields");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/form-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, eyeContact, speechLevel, socialResponse, sensoryReactions }),
      });

      const data = await response.json();
      navigate('/results', {
        state: {
          aiResult: data, formData: { age, eyeContact, speechLevel, socialResponse, sensoryReactions }
        }
      });
    } catch (err) {
      console.error(err);
      navigate('/results', {
        state: {
          aiResult: {
            therapy_goals: ["Error fetching goals"],
            activities: ["Error fetching activities"],
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white transition duration-150";
  const labelClasses = "block text-gray-700 text-sm font-medium mb-2";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl space-y-5 border border-gray-100"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-purple-700">
            AI-Assisted Autism Screening
          </h1>
          <p className="text-gray-500 text-sm">Provide details for personalized analysis</p>
        </div>

        <div>
          <label className={labelClasses}>Age</label>
          <input
            type="number"
            min="0"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Eye Contact</label>
          <select value={eyeContact} onChange={(e) => setEyeContact(e.target.value)} className={inputClasses}>
            <option value="" disabled hidden>
              Select eye contact level
            </option>
            {EYE_CONTACT_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Speech Level</label>
          <select value={speechLevel} onChange={(e) => setSpeechLevel(e.target.value)} className={inputClasses}>
            <option value="" disabled hidden>
              Select speech level
            </option>
            {SPEECH_LEVEL_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Social Response</label>
          <select value={socialResponse} onChange={(e) => setSocialResponse(e.target.value)} className={inputClasses}>
            <option value="" disabled hidden>
              Select child's response
            </option>
            {SOCIAL_RESPONSE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Sensory Reactions</label>
          {SENSORY_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={sensoryReactions.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="accent-purple-600"
              />
              <label>{option}</label>
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:opacity-90"
        >
          {loading ? "Analyzing..." : "Analyze with AI"}
        </button>
      </form>
    </div>
  );
};

export default AutismScreeningForm;
