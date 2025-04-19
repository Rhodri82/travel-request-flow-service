
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTravelForm } from './TravelFormProvider';

export const TravelDetails = () => {
  const { formData, setFormData } = useTravelForm();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.departureDate ? (
                  format(formData.departureDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.departureDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, departureDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Return Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.returnDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.returnDate ? (
                  format(formData.returnDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.returnDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, returnDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          value={formData.destination}
          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget">Budget</Label>
        <Input
          id="budget"
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
          required
        />
      </div>
    </div>
  );
};
