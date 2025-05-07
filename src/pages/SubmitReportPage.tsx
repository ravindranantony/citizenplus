import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import SubmitReportForm from '../components/Reports/SubmitReportForm';

const SubmitReportPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setIsSuccess(true);
    // Redirect to home page after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Report a Civic Issue
      </h1>
      
      <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-primary-800 font-medium">Guidelines for Reporting</h3>
            <ul className="mt-2 text-sm text-primary-700 list-disc list-inside">
              <li>Be specific about the issue you're reporting</li>
              <li>Include relevant details like exact location if possible</li>
              <li>Upload an image if available - it helps verify the issue</li>
              <li>Avoid including personal information of others</li>
              <li>Reports will be reviewed before being publicly visible</li>
            </ul>
          </div>
        </div>
      </div>
      
      {isSuccess ? (
        <div className="bg-success-50 border border-success-200 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-success-700 mb-2">
            Report Submitted Successfully!
          </h2>
          <p className="text-success-600">
            Thank you for helping improve your community. Your report has been submitted and will be reviewed.
          </p>
          <p className="text-success-600 mt-2">
            Redirecting to home page...
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SubmitReportForm onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
};

export default SubmitReportPage;