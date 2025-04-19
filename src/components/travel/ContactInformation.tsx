
import { Smartphone } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Traveller, TravelFormData } from '@/types/travel';

interface ContactInformationProps {
  formData: TravelFormData;
  updateTravellerField: (id: string, field: keyof Traveller, value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addTraveller: () => void;
  removeTraveller: (id: string) => void;
  formErrors: Record<string, string>;
}

const ContactInformation = ({
  formData,
  updateTravellerField,
  handleInputChange,
  addTraveller,
  removeTraveller,
  formErrors
}: ContactInformationProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
            Your Name
          </label>
          <Input 
            id="fullName"
            type="text" 
            value={formData.travellers[0].fullName}
            onChange={(e) => updateTravellerField(formData.travellers[0].id, 'fullName', e.target.value)}
            placeholder="John Smith"
            className="w-full"
          />
          {formErrors['travellers[0].fullName'] && (
            <div className="text-red-500 text-sm mt-1">{formErrors['travellers[0].fullName']}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employeeId">
            Employee Number
          </label>
          <Input 
            id="employeeId"
            type="text" 
            value={formData.travellers[0].employeeId}
            onChange={(e) => updateTravellerField(formData.travellers[0].id, 'employeeId', e.target.value)}
            placeholder="EMP12345"
            className="w-full"
          />
          {formErrors['travellers[0].employeeId'] && (
            <div className="text-red-500 text-sm mt-1">{formErrors['travellers[0].employeeId']}</div>
          )}
        </div>

        <div className="col-span-2">
          <label className="inline-flex items-center text-gray-700 mb-4">
            <input 
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              name="bookingOnBehalf"
              checked={formData.bookingOnBehalf}
              onChange={handleInputChange}
            />
            I am booking on behalf of someone else
          </label>
        </div>

        {formData.bookingOnBehalf && formData.travellers.slice(1).map((traveller) => (
          <div key={traveller.id} className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Traveller Name <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text"
                value={traveller.fullName}
                onChange={(e) => updateTravellerField(traveller.id, 'fullName', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Traveller Employee ID <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text"
                value={traveller.employeeId}
                onChange={(e) => updateTravellerField(traveller.id, 'employeeId', e.target.value)}
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={() => removeTraveller(traveller.id)}
              className="text-red-600 hover:text-red-800"
            >
              Remove Traveller
            </button>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input 
              type="tel"
              value={formData.travellers[0].mobile}
              onChange={(e) => updateTravellerField(formData.travellers[0].id, 'mobile', e.target.value)}
              className="pl-10 w-full"
              placeholder="+61 XXX XXX XXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternative Email (optional)
          </label>
          <Input 
            type="email"
            className="w-full"
            placeholder="alternative@email.com"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
