
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useTravelForm } from './TravelFormProvider';

export const TravellerDetails = () => {
  const { formData, setFormData } = useTravelForm();

  const addTraveller = () => {
    setFormData(prev => ({
      ...prev,
      travellers: [
        ...prev.travellers,
        {
          id: (prev.travellers.length + 1).toString(),
          firstName: '',
          lastName: '',
          email: ''
        }
      ]
    }));
  };

  const removeTraveller = (id: string) => {
    setFormData(prev => ({
      ...prev,
      travellers: prev.travellers.filter(t => t.id !== id)
    }));
  };

  const updateTraveller = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      travellers: prev.travellers.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  return (
    <div className="space-y-4">
      {formData.travellers.map((traveller, index) => (
        <Card key={traveller.id}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`firstName-${traveller.id}`}>First Name</Label>
                <Input
                  id={`firstName-${traveller.id}`}
                  value={traveller.firstName}
                  onChange={(e) => updateTraveller(traveller.id, 'firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lastName-${traveller.id}`}>Last Name</Label>
                <Input
                  id={`lastName-${traveller.id}`}
                  value={traveller.lastName}
                  onChange={(e) => updateTraveller(traveller.id, 'lastName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`email-${traveller.id}`}>Email</Label>
                <Input
                  id={`email-${traveller.id}`}
                  type="email"
                  value={traveller.email}
                  onChange={(e) => updateTraveller(traveller.id, 'email', e.target.value)}
                  required
                />
              </div>
            </div>
            {index > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeTraveller(traveller.id)}
                className="mt-4"
              >
                <UserMinus className="mr-2" />
                Remove Traveller
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={addTraveller}
        className="w-full"
      >
        <UserPlus className="mr-2" />
        Add Another Traveller
      </Button>
    </div>
  );
};
