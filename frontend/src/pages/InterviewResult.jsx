import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function InterviewResult() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterview();
  }, []);

  const fetchInterview = async () => {
    try {
      const response = await api.get(`/interviews/${interviewId}`);
      setInterview(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview:', error);
      navigate('/dashboard');
    }
  };

  if (loading || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading results...</div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm text-gray-500">Overall Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(interview.averageScore)} mt-2`}>
                {interview.averageScore.toFixed(1)}/10
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-3xl font-bold text-gray-700 mt-2">
                {formatDuration(interview.duration)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions Answered</p>
              <p className="text-3xl font-bold text-gray-700 mt-2">
                {interview.questions.length}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-700">
              <span className="font-semibold">{interview.jobRole}</span> · {' '}
              {interview.experienceLevel} level · {interview.interviewType}
            </p>
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Feedback</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {interview.questions.map((question, index) => (
              <div key={index} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    Question {index + 1}: {question.question}
                  </h3>
                  <span className={`text-2xl font-bold ${getScoreColor(question.score)} ml-4`}>
                    {question.score}/10
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Feedback:</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">{question.feedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/interview/setup')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default InterviewResult;
