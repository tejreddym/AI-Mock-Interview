import Interview from '../models/Interview.js';
import { getGeminiModel } from '../config/gemini.js';

// Create a new interview
export const createInterview = async (req, res) => {
  try {
    const { jobRole, experienceLevel, interviewType } = req.body;

    const interview = await Interview.create({
      user: req.user._id,
      jobRole,
      experienceLevel,
      interviewType: interviewType || 'mixed'
    });

    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate interview questions using Gemini AI
export const generateQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { numberOfQuestions = 5 } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const model = getGeminiModel();

    const prompt = `Generate ${numberOfQuestions} ${interview.interviewType} interview questions for a ${interview.experienceLevel} level ${interview.jobRole} position. 
    Format the response as a JSON array of strings, each string being a question.
    Make questions relevant, clear, and appropriate for the experience level.
    Example format: ["Question 1?", "Question 2?", "Question 3?"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let questions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and filter
        questions = text.split('\n')
          .filter(line => line.trim() && !line.includes('```'))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, numberOfQuestions);
      }
    } catch (parseError) {
      // Fallback parsing
      questions = text.split('\n')
        .filter(line => line.trim() && line.includes('?'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, numberOfQuestions);
    }

    // Add questions to interview
    interview.questions = questions.map(q => ({
      question: q,
      answer: '',
      score: 0,
      feedback: ''
    }));

    await interview.save();

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit answer for a question
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.params;
    const { answer } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!interview.questions[questionIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update answer
    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].answeredAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Evaluate answer using Gemini AI
export const evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.params;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const model = getGeminiModel();

    const prompt = `You are an expert interviewer evaluating a candidate's answer.
    
Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}
Question: ${question.question}
Answer: ${question.answer}

Evaluate this answer and provide:
1. A score from 0-10 (where 0 is completely wrong/irrelevant and 10 is excellent)
2. Constructive feedback (2-3 sentences)

Format your response as JSON:
{
  "score": <number between 0-10>,
  "feedback": "<your feedback here>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the evaluation
    let evaluation;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback evaluation
        evaluation = {
          score: 5,
          feedback: text.trim()
        };
      }
    } catch (parseError) {
      evaluation = {
        score: 5,
        feedback: text.trim()
      };
    }

    // Update question with score and feedback
    interview.questions[questionIndex].score = Math.min(Math.max(evaluation.score, 0), 10);
    interview.questions[questionIndex].feedback = evaluation.feedback;

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        score: interview.questions[questionIndex].score,
        feedback: interview.questions[questionIndex].feedback
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Complete interview
export const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { duration } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = duration || 0;

    await interview.save();

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all interviews for a user
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      user: req.user._id,
      status: 'completed'
    });

    const stats = {
      totalInterviews: interviews.length,
      averageScore: 0,
      totalQuestions: 0,
      improvementTrend: []
    };

    if (interviews.length > 0) {
      const totalScore = interviews.reduce((sum, interview) => sum + interview.averageScore, 0);
      stats.averageScore = totalScore / interviews.length;
      stats.totalQuestions = interviews.reduce((sum, interview) => sum + interview.questions.length, 0);
      
      // Last 5 interviews for trend
      stats.improvementTrend = interviews
        .slice(0, 5)
        .reverse()
        .map(interview => ({
          date: interview.completedAt,
          score: interview.averageScore
        }));
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
