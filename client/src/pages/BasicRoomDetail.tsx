import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Room } from '../types';
import { roomsAPI, inquiriesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './BasicRoomDetail.css';

const BasicRoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    message: '',
    moveInDate: '',
    duration: ''
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRoom = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await roomsAPI.getRoom(id);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      setAlert({ type: 'error', message: 'Failed to load room details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !user) return;

    try {
      setInquiryLoading(true);
      await inquiriesAPI.createInquiry({
        roomId: room._id,
        message: inquiryData.message,
        moveInDate: inquiryData.moveInDate,
        stayDuration: inquiryData.duration
      });
      
      setAlert({ type: 'success', message: 'Inquiry sent successfully!' });
      setInquiryOpen(false);
      setInquiryData({ message: '', moveInDate: '', duration: '' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setAlert({ type: 'error', message: 'Failed to send inquiry' });
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading room details...</div>;
  }

  if (!room) {
    return <div className="error-container">Room not found</div>;
  }

  return (
    <div className="room-detail-container">
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
          <button onClick={() => setAlert(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="room-detail-content">
        {/* Images and Details */}
        <div className="room-main">
          <div className="room-image-container">
            {room.images.length > 0 ? (
              <img
                src={room.images[0].url}
                alt={room.title}
                className="room-main-image"
              />
            ) : (
              <div className="placeholder-main-image">No image available</div>
            )}
          </div>

          <h1 className="room-title">{room.title}</h1>

          <div className="room-location">
            📍 {room.location.address}, {room.location.city}, {room.location.state} {room.location.zipCode}
          </div>

          <div className="room-tags">
            <span className="tag room-type">{room.roomType}</span>
            <span className={`tag availability ${room.availability.available ? 'available' : 'unavailable'}`}>
              {room.availability.available ? 'Available' : 'Not Available'}
            </span>
          </div>

          <div className="room-section">
            <h3>Description</h3>
            <p>{room.description}</p>
          </div>

          {room.amenities.length > 0 && (
            <div className="room-section">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {room.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Card */}
        <div className="contact-card">
          <h3>Contact Owner</h3>
          
          <div className="owner-info">
            <div className="owner-avatar">
              {room.owner.name.charAt(0).toUpperCase()}
            </div>
            <div className="owner-details">
              <div className="owner-name">{room.owner.name}</div>
              <div className="owner-role">Room Owner</div>
            </div>
          </div>

          <div className="price-section">
            <span className="price">${room.price}/month</span>
          </div>

          <div className="contact-info">
            <div className="contact-item">
              📧 {room.owner.email}
            </div>
            {room.owner.phone && (
              <div className="contact-item">
                📞 {room.owner.phone}
              </div>
            )}
          </div>

          {user ? (
            user.role === 'owner' && user._id === room.owner._id ? (
              <div className="owner-message">This is your room listing</div>
            ) : (
              <button
                className="inquiry-button"
                onClick={() => setInquiryOpen(true)}
                disabled={!room.availability.available}
              >
                Send Inquiry
              </button>
            )
          ) : (
            <button
              className="login-button"
              onClick={() => navigate('/login')}
            >
              Login to Contact
            </button>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="modal-overlay" onClick={() => setInquiryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Inquiry</h3>
              <button onClick={() => setInquiryOpen(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleInquirySubmit} className="inquiry-form">
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell the owner about yourself and why you're interested in this room..."
                  required
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Preferred Move-in Date</label>
                <input
                  type="date"
                  value={inquiryData.moveInDate}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, moveInDate: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>Duration</label>
                <select
                  value={inquiryData.duration}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, duration: e.target.value }))}
                >
                  <option value="">Select duration</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1+ years">1+ years</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setInquiryOpen(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" disabled={inquiryLoading || !inquiryData.message} className="submit-button">
                  {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicRoomDetail;