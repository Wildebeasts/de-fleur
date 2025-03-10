import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import eventApi from '@/lib/services/eventApi'
import { EventResponse } from '@/lib/types/Event'
import { toast } from 'sonner'

type EventListProps = {
  events: EventResponse[]
  activeEvent: string | null
  setActiveEvent: React.Dispatch<React.SetStateAction<string | null>> // Accept the setter function
  loading: boolean
  error: string | null
}

const EventList: React.FC<EventListProps> = ({
  events,
  activeEvent,
  setActiveEvent,
  loading,
  error
}) => {
  const applyEvent = async (eventName: string) => {
    try {
      const response = await eventApi.applyEvent(eventName)
      if (response.data.isSuccess) {
        toast.success('Current event is ' + eventName)
        setActiveEvent(eventName) // Update the active event on success
      }
    } catch (error) {
      toast.error('Failed to apply event ' + error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card
          key={event.name}
          className={`cursor-pointer shadow-md transition-shadow hover:shadow-lg ${
            activeEvent === event.name
              ? 'border-2 border-blue-500 bg-blue-100'
              : ''
          }`}
          onClick={() => applyEvent(event.name)}
        >
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Discount:{' '}
              <span className="font-semibold">{event.discountPercentage}%</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default EventList
