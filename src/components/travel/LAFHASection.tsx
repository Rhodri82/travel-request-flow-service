
import { Input } from "@/components/ui/input";
import { LAFHADetails, TravelFormData } from '@/types/travel';
import { LAFHA_RATES } from '@/constants/lafha';

interface LAFHASectionProps {
  formData: TravelFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  updateLAFHA: (index: number, field: keyof LAFHADetails, value: any) => void;
  addLAFHA: () => void;
  removeLAFHA: (index: number) => void;
}

const LAFHASection = ({
  formData,
  handleInputChange,
  updateLAFHA,
  addLAFHA,
  removeLAFHA
}: LAFHASectionProps) => {
  if (!formData.requireLAFHA) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">LAFHA Details</h2>
      
      {formData.lafha.map((item, index) => (
        <div key={item.id} className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LAFHA Category
              </label>
              <select
                value={item.category}
                onChange={(e) => updateLAFHA(index, 'category', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {Object.keys(LAFHA_RATES).map((rate) => (
                  <option key={rate} value={rate}>
                    {rate} (${LAFHA_RATES[rate as keyof typeof LAFHA_RATES]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <Input
                type="number"
                value={item.days}
                onChange={(e) => updateLAFHA(index, 'days', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate
              </label>
              <Input
                type="number"
                value={item.rate}
                onChange={(e) => updateLAFHA(index, 'rate', e.target.value)}
                className="w-full"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <Input
                type="text"
                value={`$${(item.rate * item.days).toFixed(2)}`}
                className="w-full bg-gray-100"
                readOnly
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeLAFHA(index)}
            className="mt-4 text-red-600 hover:text-red-800"
          >
            Remove LAFHA Entry
          </button>
        </div>
      ))}

      <button
        type="button"
        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        onClick={addLAFHA}
      >
        + Add LAFHA Entry
      </button>
    </div>
  );
};

export default LAFHASection;
