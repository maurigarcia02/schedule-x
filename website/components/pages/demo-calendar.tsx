'use client'

import { viewDay, viewMonthGrid, viewWeek } from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { ScheduleXCalendar, useNextCalendarApp } from '@schedule-x/react'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import { useState } from 'react'

export default function CalendarDemoPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Coffee with John',
      description: 'Discuss project updates',
      location: 'Starbucks Downtown',
      people: ['John Doe', 'Jane Smith'],
      start: Temporal.ZonedDateTime.from('2023-12-04T10:05:00+01:00[Europe/Berlin]'),
      end: Temporal.ZonedDateTime.from('2023-12-04T10:35:00+01:00[Europe/Berlin]'),
    },
    {
      id: 2,
      title: 'Team Meeting',
      start: Temporal.ZonedDateTime.from('2023-12-04T14:00:00+01:00[Europe/Berlin]'),
      end: Temporal.ZonedDateTime.from('2023-12-04T15:30:00+01:00[Europe/Berlin]'),
    },
  ])

  const calendarApp = useNextCalendarApp({
    views: [viewWeek, viewMonthGrid, viewDay],
    defaultView: viewWeek.name,
    selectedDate: Temporal.PlainDate.from('2023-12-04'),
    events: events,
    callbacks: {
      onEventUpdate(updatedEvent) {
        console.log('Event updated:', updatedEvent)
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
      },
      onEventClick(calendarEvent) {
        console.log('Event clicked:', calendarEvent)
      },
      onDoubleClickDateTime(dateTime) {
        console.log('Double clicked on date time:', dateTime)
        // Create new event
        const newEvent = {
          id: Date.now(),
          title: 'New Event',
          start: dateTime,
          end: dateTime.add({ hours: 1 }),
        }
        setEvents([...events, newEvent])
      },
      onDoubleClickDate(date) {
        console.log('Double clicked on date:', date)
        // Create all-day event
        const newEvent = {
          id: Date.now(),
          title: 'New All-Day Event',
          start: date,
          end: date,
        }
        setEvents([...events, newEvent])
      },
    },
    plugins: [
      createDragAndDropPlugin(),
      createEventModalPlugin(),
    ],
  })

  return (
    <div className="page-wrapper">
      <h1>Schedule-X Calendar Demo</h1>
      <p>💡 Double-click on any time slot to create a new event</p>
      <div style={{ width: '100%', height: '800px' }}>
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>
    </div>
  )
}