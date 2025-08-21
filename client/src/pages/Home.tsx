import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
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
  Pagination,
} from '@mui/material';
import { Search, LocationOn, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Room, RoomFilters } from '../types';
import { roomsAPI } from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>({
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const [searchForm, setSearchForm] = useState({
    city: '',
    roomType: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomsAPI.getRooms(filters);
      setRooms(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: RoomFilters = {
      ...filters,
      page: 1,
    };

    if (searchForm.city) newFilters.city = searchForm.city;
    if (searchForm.roomType) newFilters.roomType = searchForm.roomType;
    if (searchForm.maxPrice) newFilters.maxPrice = Number(searchForm.maxPrice);

    setFilters(newFilters);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, page: value });
  };

  const formatPrice = (price: number, priceType: string) => {
    const typeMap = {
      per_night: '/night',
      per_week: '/week',
      per_month: '/month',
    };
    return `$${price}${typeMap[priceType as keyof typeof typeMap] || '/month'}`;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h2" component="h1" textAlign="center" gutterBottom>
          Find Your Perfect Room
        </Typography>
        <Typography variant="h5" textAlign="center" sx={{ mb: 4, opacity: 0.9 }}>
          Discover comfortable and affordable rental rooms in your desired location
        </Typography>

        {/* Search Form */}
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Enter city"
                value={searchForm.city}
                onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ backgroundColor: 'white', borderRadius: 1 }}>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={searchForm.roomType}
                  label="Room Type"
                  onChange={(e) => setSearchForm({ ...searchForm, roomType: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="double">Double</MenuItem>
                  <MenuItem value="shared">Shared</MenuItem>
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Max Price"
                type="number"
                value={searchForm.maxPrice}
                onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  backgroundColor: '#ff6b6b',
                  '&:hover': { backgroundColor: '#ff5252' },
                  height: 56,
                }}
              >
                <Search />
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Results Section */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Available Rooms ({pagination.total})
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s' },
                    }}
                    onClick={() => navigate(`/rooms/${room._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        room.images.length > 0
                          ? `http://localhost:12001${room.images[0].url}`
                          : '/placeholder-room.jpg'
                      }
                      alt={room.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {room.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {room.location.city}, {room.location.state}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {room.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <Chip key={amenity} label={amenity} size="small" />
                        ))}
                        {room.amenities.length > 3 && (
                          <Chip label={`+${room.amenities.length - 3} more`} size="small" />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Typography variant="h6" color="primary">
                        {formatPrice(room.price, room.priceType)}
                      </Typography>
                      <Chip
                        label={room.roomType}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.current}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;