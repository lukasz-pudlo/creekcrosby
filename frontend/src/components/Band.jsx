import React from 'react';
import { useInView } from 'react-intersection-observer';
import './Band.css';

const Band = ({ band }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="band" id="band">
            <div className="container">
                <h2 className="section-title">Our Band</h2>

                <div
                    className={`band-grid ${inView ? 'animate' : ''}`}
                    ref={ref}
                >
                    {band && band.length > 0 ? (
                        band.map((member) => (
                            <div key={member.id} className="band-member">
                                {member.image ? (
                                    <div className="member-image">
                                        <img src={member.image} alt={`${member.name}, ${member.position}`} />
                                    </div>
                                ) : (
                                    <div className="member-image member-placeholder">
                                        <span className="initials">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                )}
                                <div className="member-info">
                                    <h3>{member.name}</h3>
                                    <p className="member-position">{member.position}</p>
                                    <p className="member-bio">{member.bio}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-band">
                            <p>Band information coming soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Band;