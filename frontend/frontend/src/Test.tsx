import React from "react";

const Test: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-lg">
        <h1 className="text-2xl font-bold text-blue-500">Hello, Tailwind CSS!</h1>
        <p className="mt-4 text-gray-700">
          This is a simple test to confirm Tailwind CSS is working.
        </p>
        <button className="px-4 py-2 mt-4 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600">
          Click Me
        </button>
      </div>
    </div>
  );
};

export default Test;
