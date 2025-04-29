
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RootState } from '@/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormDialog } from '@/components/shared/FormDialog';
import { AddEventForm } from '@/components/forms/AddEventForm';
import { toggleModal } from '@/store/slices/uiSlice';

const OwnerCalendar = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<string>('month');
  const { modals } = useSelector((state: RootState) => state.ui);
  
  // Mock calendar events
  const events = [
    { id: 1, title: 'Client Meeting - ABC Corp', date: new Date(2025, 3, 28, 10, 0), type: 'meeting' },
    { id: 2, title: 'GST Filing Deadline', date: new Date(2025, 3, 30, 0, 0), type: 'deadline' },
    { id: 3, title: 'Team Review', date: new Date(2025, 3, 25, 14, 30), type: 'internal' },
    { id: 4, title: 'Audit Planning - XYZ Industries', date: new Date(2025, 4, 2, 11, 0), type: 'meeting' },
    { id: 5, title: 'Monthly Reporting', date: new Date(2025, 4, 5, 9, 0), type: 'internal' },
  ];
  
  // Get today's events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === (date ? date.toDateString() : new Date().toDateString());
  });

  // Helper function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'deadline':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'internal':
        return 'border-l-4 border-purple-500 bg-purple-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const handleOpenAddEventModal = () => {
    dispatch(toggleModal({ modal: 'addEvent', value: true }));
  };
  
  const handleCloseAddEventModal = () => {
    dispatch(toggleModal({ modal: 'addEvent', value: false }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="bg-ca-blue hover:bg-ca-blue-dark"
            onClick={handleOpenAddEventModal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 shadow-md">
          <CardHeader className="bg-gradient-to-r from-ca-blue/10 to-transparent pb-6">
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-3"
            />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-ca-green/10 to-transparent pb-6">
            <CardTitle>{date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Today'}</CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents.map(event => (
                  <div key={event.id} className={`p-4 rounded-md ${getEventTypeStyles(event.type)}`}>
                    <p className="text-sm font-medium">{formatTime(event.date)} - {event.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No events scheduled for today</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <FormDialog
        open={modals.addEvent}
        onOpenChange={handleCloseAddEventModal}
        title="Add New Event"
        description="Schedule a new event in your calendar"
        showFooter={false}
      >
        <AddEventForm onSuccess={handleCloseAddEventModal} />
      </FormDialog>
    </div>
  );
};

export default OwnerCalendar;
