import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Interview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInterview();
    startCamera();
    startTimer();

    return () => {
      stopCamera();
      stopTimer();
    };
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setSubmitting(true);
    setEvaluating(true);

    try {
      // Submit answer
      await api.post(
        `/interviews/${interviewId}/questions/${currentQuestionIndex}/answer`,
        { answer }
      );

      // Evaluate answer
      const evaluationRes = await api.post(
        `/interviews/${interviewId}/questions/${currentQuestionIndex}/evaluate`
      );

      setCurrentFeedback(evaluationRes.data.data);
      setShowFeedback(true);
      
      // Refresh interview data
      await fetchInterview();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
    setAnswer('');
    
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    try {
      await api.put(`/interviews/${interviewId}/complete`, {
        duration: timer
      });
      stopCamera();
      stopTimer();
      navigate(`/interview/result/${interviewId}`);
    } catch (error) {
      console.error('Error completing interview:', error);
      alert('Failed to complete interview');
    }
  };

  if (loading || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading interview...</div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">{interview.jobRole}</h1>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-mono text-gray-700">
                ⏱️ {formatTime(timer)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {interview.questions.length}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Camera Preview</h2>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-lg bg-gray-900"
                style={{ aspectRatio: '4/3' }}
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Make sure you're in frame
              </p>
            </div>
          </div>

          {/* Question and Answer */}
          <div className="lg:col-span-2">
            {!showFeedback ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentQuestion.question}
                </h2>

                <div className="mb-6">
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    id="answer"
                    rows="12"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Take your time to provide a detailed answer
                  </p>
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim()}
                  className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (evaluating ? 'Evaluating answer...' : 'Submitting...') : 'Submit Answer'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h2>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 mr-3">Score:</span>
                    <span className="text-4xl font-bold text-indigo-600">
                      {currentFeedback?.score}/10
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {currentFeedback?.feedback}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {currentQuestionIndex < interview.questions.length - 1 
                    ? 'Next Question' 
                    : 'Complete Interview'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Interview;
