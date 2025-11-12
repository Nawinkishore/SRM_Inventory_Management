import React from "react";
import { Mail, Phone, MapPin, Building2, User } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-3xl border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User size={24} className="text-blue-600" />
            Company Profile
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium transition">
            Edit Profile
          </button>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SRM MOTORS</h3>
              <p className="text-sm text-gray-600">Automobile Parts & Service Center</p>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 mt-1" size={18} />
              <div>
                <p className="text-gray-700">
                  2/89C, Anna Nagar, Sendurai<br />
                  Ariyalur - 621714
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" size={18} />
              <p className="text-gray-700">7825 914040 , 7825 924040</p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={18} />
              <p className="text-gray-700">srmmotorssendurai@gmail.com</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-600" size={18} />
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Owner:</span> Nawin Kishore
                </p>
                <p className="text-sm text-gray-600">Founder & Administrator</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Business Hours</h4>
              <p className="text-sm text-gray-700">
                Mon - Sat: 9:00 AM – 7:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">About</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                SRM Motors is a trusted automobile service center providing high-quality 
                spare parts and professional vehicle maintenance services in Ariyalur.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t mt-6 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SRM Motors — All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Profile;
