import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-2xl text-center border">
        {/* Company Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">SRM MOTORS</h1>
        <p className="text-gray-600">
          2/89C, Anna Nagar, Sendurai<br />
          Ariyalur - 621714
        </p>
        <p className="text-gray-600 mt-1">
          <span className="font-medium">Mobile:</span> 7825 914040 , 7825 924040
        </p>
        <p className="text-gray-600 mt-1">
          <span className="font-medium">E-mail:</span> srmmotorssendurai@gmail.com
        </p>

        {/* Divider */}
        <div className="border-t my-6"></div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-8">
          Welcome to <span className="font-semibold text-blue-600">SRM MOTORS</span> — your trusted 
          partner in automotive parts and services. We specialize in providing 
          quality spare parts and professional maintenance solutions to keep 
          your vehicles running smoothly.
        </p>

        {/* Button */}
        <Link
          to="/dashboard/invoice"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-md transition"
        >
          <FileText size={18} />
          Generate Invoice
        </Link>
      </div>
    </div>
  );
};

export default Home;
