
import React from 'react';

interface DeclarationsProps {
  declarations: {
    correctAndApproved: boolean;
    payrollDeduction: boolean;
    audit: boolean;
    ctmBookings: boolean;
    noPersonalCards: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formErrors: Record<string, string>;
}

const Declarations: React.FC<DeclarationsProps> = ({
  declarations,
  handleInputChange,
  formErrors
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Declarations</h2>
      <div className="space-y-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            name="declarations.correctAndApproved"
            checked={declarations.correctAndApproved}
            onChange={handleInputChange}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">
            I declare that all information provided is correct and approved by my manager
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            name="declarations.payrollDeduction"
            checked={declarations.payrollDeduction}
            onChange={handleInputChange}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">
            I understand that any personal expenses will be deducted from my payroll
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            name="declarations.audit"
            checked={declarations.audit}
            onChange={handleInputChange}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">
            I understand this booking may be subject to audit
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            name="declarations.ctmBookings"
            checked={declarations.ctmBookings}
            onChange={handleInputChange}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to book all travel through CTM Travel
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            name="declarations.noPersonalCards"
            checked={declarations.noPersonalCards}
            onChange={handleInputChange}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">
            I understand not to use personal credit cards for business travel
          </span>
        </label>
      </div>
      {formErrors.declarations && (
        <div className="text-red-500 text-sm mt-4">{formErrors.declarations}</div>
      )}
    </div>
  );
};

export default Declarations;
