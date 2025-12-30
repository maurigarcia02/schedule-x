'use client'

import { viewDay, viewMonthGrid, viewWeek } from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import { useEffect, useRef, useState } from 'react'
import EventEditModal from '../partials/event-edit-modal/event-edit-modal'

const STORAGE_KEY = 'schedule-x-events'

// Helper functions to save/load events
const saveEventsToStorage = (events: any[]) => {
  try {
    const serializedEvents = events.map(event => ({
      ...event,
      start: event.start?.toString?.() || event.start,
      end: event.end?.toString?.() || event.end,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedEvents))
  } catch (error) {
    console.error('Error saving events to storage:', error)
  }
}

const loadEventsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const events = JSON.parse(stored)
    return events.map((event: any) => ({
      ...event,
      start: event.start.includes('T') 
        ? Temporal.ZonedDateTime.from(event.start)
        : Temporal.PlainDate.from(event.start),
      end: event.end.includes('T')
        ? Temporal.ZonedDateTime.from(event.end)
        : Temporal.PlainDate.from(event.end),
    }))
  } catch (error) {
    console.error('Error loading events from storage:', error)
    return []
  }
}

export default function CalendarDemoPage() {
  const calendarAppRef = useRef<any>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [initialEvents] = useState(() => {
    // Load events from localStorage on initial render
    const savedEvents = loadEventsFromStorage()
    
    // If no saved events, use default events
    if (savedEvents.length === 0) {
      return [
        {
          id: '1',
          title: 'Coffee with John',
          description: 'Discuss project updates',
          location: 'Starbucks Downtown',
          people: ['John Doe', 'Jane Smith'],
          start: Temporal.ZonedDateTime.from('2023-12-04T10:05:00+01:00[Europe/Berlin]'),
          end: Temporal.ZonedDateTime.from('2023-12-04T10:35:00+01:00[Europe/Berlin]'),
        },
        {
          id: '2',
          title: 'Team Meeting',
          start: Temporal.ZonedDateTime.from('2023-12-04T14:00:00+01:00[Europe/Berlin]'),
          end: Temporal.ZonedDateTime.from('2023-12-04T15:30:00+01:00[Europe/Berlin]'),
        },
      ]
    }
    
    return savedEvents
  })

  const syncEventsToStorage = () => {
    if (!calendarAppRef.current) return
    const allEvents = calendarAppRef.current.events.getAll()
    saveEventsToStorage(allEvents)
  }

  const calendarApp = useNextCalendarApp({
    views: [viewWeek, viewMonthGrid, viewDay],
    defaultView: viewWeek.name,
    selectedDate: Temporal.PlainDate.from('2023-12-04'),
    events: initialEvents,
    callbacks: {
      onEventClick(calendarEvent) {
        console.log('Event clicked:', calendarEvent)
        setEditingEvent(calendarEvent)
      },
      onDoubleClickDateTime(dateTime) {
        console.log('Double clicked on date time:', dateTime?.toString?.())
        
        if (!dateTime || !calendarAppRef.current) {
          console.error('No dateTime or calendarApp')
          return
        }
        
        try {
          const endTime = dateTime.add({ hours: 1 })
          
          const newEvent = {
            id: String(Date.now()),
            title: 'New Event',
            start: dateTime,
            end: endTime,
          }
          
          console.log('Adding new event:', newEvent.title, newEvent.start?.toString?.())
          calendarAppRef.current.events.add(newEvent)
          
          // Save to localStorage after adding
          setTimeout(syncEventsToStorage, 100)
        } catch (error) {
          console.error('Error creating event:', error)
        }
      },
      onDoubleClickDate(date) {
        console.log('Double clicked on date:', date?.toString?.())
        
        if (!date || !calendarAppRef.current) {
          console.error('Invalid date or calendarApp')
          return
        }
        
        const newEvent = {
          id: String(Date.now()),
          title: 'New All-Day Event',
          start: date,
          end: date,
        }
        
        console.log('Adding new all-day event:', newEvent)
        calendarAppRef.current.events.add(newEvent)
        
        // Save to localStorage after adding
        setTimeout(syncEventsToStorage, 100)
      },
    },
    plugins: [
      createDragAndDropPlugin(),
      createEventModalPlugin(),
    ],
  })

  useEffect(() => {
    if (calendarApp) {
      calendarAppRef.current = calendarApp
      console.log('Calendar app initialized:', calendarApp)
    }
  }, [calendarApp])

  const handleSaveEvent = (updatedEvent: any) => {
    if (!calendarAppRef.current) return
    calendarAppRef.current.events.update(updatedEvent)
    setEditingEvent(null)
    
    // Save to localStorage after updating
    setTimeout(syncEventsToStorage, 100)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!calendarAppRef.current) return
    calendarAppRef.current.events.remove(eventId)
    setEditingEvent(null)
    
    // Save to localStorage after deleting
    setTimeout(syncEventsToStorage, 100)
  }

  const handleCloseModal = () => {
    setEditingEvent(null)
  }

  return (
    <div className="page-wrapper">
      <h1>Schedule-X Calendar Demo</h1>
      <p>💡 Double-click on any time slot to create a new event</p>
      <div style={{ width: '100%', height: '800px' }}>
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>

      <EventEditModal
        event={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onClose={handleCloseModal}
      />
    </div>
  )
}