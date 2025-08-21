import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { Search, LocationOn, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Room, RoomFilters } from '../types';
import { roomsAPI } from '../services/api';

const SimpleHome: React.FC = () => {
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
      const response = await roomsAPI.getRooms(filters);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Find Your Perfect Room
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Discover comfortable and affordable rental rooms in your desired location
        </Typography>

        {/* Search Form */}
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Enter city"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            
            <FormControl fullWidth sx={{ backgroundColor: 'white', borderRadius: 1 }}>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={filters.roomType}
                label="Room Type"
                onChange={(e) => handleFilterChange('roomType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="single">Single Room</MenuItem>
                <MenuItem value="double">Double Room</MenuItem>
                <MenuItem value="shared">Shared Room</MenuItem>
                <MenuItem value="studio">Studio</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              placeholder="Max Price"
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSearch}
              startIcon={<Search />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                minWidth: 120
              }}
            >
              Search
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Rooms Section */}
      <Box sx={{ py: 6, px: 2 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Available Rooms
        </Typography>
        
        {loading ? (
          <Typography textAlign="center" sx={{ py: 4 }}>
            Loading rooms...
          </Typography>
        ) : rooms.length === 0 ? (
          <Typography textAlign="center" sx={{ py: 4 }}>
            No rooms found. Try adjusting your search criteria.
          </Typography>
        ) : (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3,
                mt: 4
              }}
            >
              {rooms.map((room) => (
                <Card
                  key={room._id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => navigate(`/rooms/${room._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={room.images[0]?.url || '/placeholder-room.jpg'}
                    alt={room.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {room.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {room.location.city}, {room.location.state}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {room.description.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={room.roomType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={room.availability.available ? 'Available' : 'Not Available'}
                        size="small"
                        color={room.availability.available ? 'success' : 'error'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${room.price}/month
                    </Typography>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SimpleHome;