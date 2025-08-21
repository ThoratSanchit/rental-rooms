import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, RoomFilters } from '../types';
import { roomsAPI } from '../services/api';
import './BasicHome.css';

const BasicHome: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({
    city: '',
    roomType: '',
    maxPrice: undefined,
    page: 1,
    limit: 12
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching rooms with filters:', filters);
      console.log('API Base URL:', process.env.NODE_ENV === 'production' 
        ? 'https://work-2-njnudoadvnxutjxt.prod-runtime.all-hands.dev/api'
        : 'http://localhost:12001/api');
      const response = await roomsAPI.getRooms(filters);
      console.log('API response:', response.data);
      setRooms(response.data.data);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching rooms...');
    fetchRooms();
  }, []);

  const handleSearch = () => {
    fetchRooms();
  };

  const handleFilterChange = (field: keyof RoomFilters, value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [field]: field === 'maxPrice' ? (value ? Number(value) : undefined) : value 
    }));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Room</h1>
          <p>Discover comfortable and affordable rental rooms in your desired location</p>
          
          {/* Search Form */}
          <div className="search-form">
            <input
              type="text"
              placeholder="Enter city"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="search-input"
            />
            
            <select
              value={filters.roomType || ''}
              onChange={(e) => handleFilterChange('roomType', e.target.value)}
              className="search-select"
            >
              <option value="">All Types</option>
              <option value="single">Single Room</option>
              <option value="double">Double Room</option>
              <option value="shared">Shared Room</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
            </select>
            
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="search-input"
            />
            
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="rooms-section">
        <h2>Available Rooms</h2>
        
        {loading ? (
          <div className="loading">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="no-rooms">No rooms found. Try adjusting your search criteria.</div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="room-card"
                onClick={() => navigate(`/rooms/${room._id}`)}
              >
                <div className="room-image">
                  {room.images[0]?.url ? (
                    <img src={room.images[0].url} alt={room.title} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                
                <div className="room-content">
                  <h3>{room.title}</h3>
                  <p className="room-location">
                    {room.location.city}, {room.location.state}
                  </p>
                  <p className="room-description">
                    {room.description.substring(0, 100)}...
                  </p>
                  
                  <div className="room-tags">
                    <span className="tag room-type">{room.roomType}</span>
                    <span className={`tag availability ${room.availability.available ? 'available' : 'unavailable'}`}>
                      {room.availability.available ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  
                  <div className="room-footer">
                    <span className="price">${room.price}/month</span>
                    <button className="view-button">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicHome;