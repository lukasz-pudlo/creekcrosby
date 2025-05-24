import React from 'react';
import { useInView } from 'react-intersection-observer';
import './Events.css';

const Events = ({ events }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <section className="events" id="events">
            <div className="container">
                <h2 className="section-title">Upcoming Events</h2>

                <div
                    className={`events-grid ${inView ? 'animate' : ''}`}
                    ref={ref}
                >
                    {events && events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id} className="event-card">
                                {event.image && (
                                    <div className="event-image">
                                        <img src={event.image} alt={event.title} />
                                    </div>
                                )}
                                <div className="event-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <div className="event-details">
                                        <p className="event-date">
                                            <span className="icon">📅</span> {formatDate(event.date)}
                                        </p>
                                        <p className="event-time">
                                            <span className="icon">🕒</span> {formatTime(event.date)}
                                        </p>
                                        <p className="event-location">
                                            <span className="icon">📍</span> {event.location}
                                        </p>
                                    </div>
                                    <p className="event-description">{event.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-events">
                            <p>Upcoming shows:</p>
                            <div className="event-card">
                                <div className="event-content">
                                    <h3 className="event-title">Live at Blackfriars, Glasgow</h3>
                                    <div className="event-details">
                                        <p className="event-date">
                                            <span className="icon">📅</span> August 6th and September 24th
                                        </p>
                                        <p className="event-time">
                                            <span className="icon">🕒</span> Doors open from 21:00
                                        </p>
                                        <p className="event-location">
                                            <span className="icon">📍</span> Blackfriars, Glasgow
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Events;