import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Button from "../generic/Button";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/overview");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-mint opacity-80 mx-auto" />
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-white-light mb-2 font-game tracking-widest">
              404
            </h1>
            <div className="w-16 h-1 bg-mint mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-xl text-white-light font-light mb-3 tracking-wide">
              Page Not Found
            </h2>
            <p className="text-white-darker text-sm leading-relaxed">
              Oh no! This page doesn't exist or has been moved. Please check the
              URL or return to the homepage.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleGoHome}
              icon={<HomeIcon className="h-5 w-5" />}
              fullWidth
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              Back to Overview
            </Button>

            <Button
              variant="secondary"
              onClick={handleGoBack}
              icon={<ArrowLeftIcon className="h-4 w-4" />}
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
