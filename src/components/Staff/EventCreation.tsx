import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import EventList from './EventList'
import { EventCreateRequest, EventResponse } from '@/lib/types/Event'
import eventApi from '@/lib/services/eventApi'
import { toast } from 'sonner'

const EventCreation: React.FC = () => {
  const [eventDetails, setEventDetails] = useState<EventCreateRequest>({
    name: '',
    description: '',
    discountPercentage: 0
  })
  const [events, setEvents] = useState<EventResponse[]>([])
  const [activeEvent, setActiveEvent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      const response = await eventApi.getAllEvents()
      if (response.data.isSuccess) {
        setEvents(response.data.data!) // Assuming the response structure is { data: EventResponse[] }
        const active = response.data.data!.find((event) => event.isActive)
        setActiveEvent(active?.name || null)
      }
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch events')
      setLoading(false)
    }
  }

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEventDetails((prev) => ({
      ...prev,
      [name]: name === 'discountPercentage' ? Number(value) : value
    }))
  }

  const handleSubmit = async () => {
    // Validation
    const validationErrors: { [key: string]: string } = {}

    if (!eventDetails.name.trim()) {
      validationErrors.name = 'Event name is required'
    }
    if (!eventDetails.description.trim()) {
      validationErrors.description = 'Description is required'
    }
    if (
      eventDetails.discountPercentage < 0 ||
      eventDetails.discountPercentage > 100
    ) {
      validationErrors.DiscountPercentage = 'Discount must be between 0 and 100'
    }

    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`)
      })
      return
    }

    try {
      await eventApi.createEvent(eventDetails)
      toast.success('Event created successfully')
      setEventDetails({ name: '', description: '', discountPercentage: 0 })
      fetchEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('An error occurred while creating the event')
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Create Event Form (Left Side) */}
          <Card className="flex-1 rounded-2xl bg-white shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Create Event
              </CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the details below to create a new event.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Event Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={eventDetails.name}
                    onChange={handleEventChange}
                    placeholder="Enter event name"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Event Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={eventDetails.description}
                    onChange={handleEventChange}
                    placeholder="Enter event description"
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Discount Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage" className="text-gray-700">
                    Discount Percentage
                  </Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={eventDetails.discountPercentage}
                    onChange={handleEventChange}
                    placeholder="Enter discount percentage"
                    className="focus:ring-2 focus:ring-blue-500"
                    min={0}
                    max={100}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <CardFooter className="flex justify-end rounded-b-2xl p-4">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Create Event
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </form>

        {/* Event List (Right Side) */}
        <div className="flex-1">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">All Events</h2>
          <EventList
            events={events}
            activeEvent={activeEvent}
            setActiveEvent={setActiveEvent} // Pass the setter function
            error={error}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default EventCreation
