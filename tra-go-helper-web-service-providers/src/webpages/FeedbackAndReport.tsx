import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 

interface FeedbackPanelProps {
  onSubmit: (feedback: string) => void;
  feedbacks: string[];
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ onSubmit, feedbacks }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [serviceProviderID] = useState<string | null>(null);

  useEffect(() => {
    const feedbackAccRef = db.ref('FeedbackAcc');
    feedbackAccRef.once('value', (snapshot) => {
      if (!snapshot.exists()) {
        feedbackAccRef.set([]); 
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      if (!feedback.trim()) {
        setValidationMessage('Feedback cannot be empty');
        return;
      }

      const feedbackAccRef = db.ref('FeedbackAcc');

      await feedbackAccRef.push({
        feedback: feedback,
        ID: serviceProviderID || 'NoServiceProvider',
        timestamp: new Date().toString(),
      });

      onSubmit(feedback);
      setFeedback('');
      setValidationMessage('Feedback submitted successfully');
    } catch (error) {
      console.error('Error handling feedback:', error);
      setValidationMessage('Error submitting feedback');
    }
  };

  return (
    <div className="FeedbackPanel">
      <div className="FeedbackForm">
        <h2>Write Feedback</h2>
        <textarea
          rows={4}
          placeholder="Enter your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <br />
        <button onClick={handleSubmit}>Submit Feedback</button>
        {validationMessage && <p className="validation-message">{validationMessage}</p>}
      </div>
      <div className="FeedbackList">
        <h2>Feedback List</h2>
        <ul>
          {/* {feedbacks.map((feedback, index) => (
            <li key={index}>{feedback}</li>
          ))} */}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackPanel;
