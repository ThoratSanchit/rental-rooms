import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  Stack,
  Paper,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Visibility as ViewIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { roomsAPI, inquiriesAPI } from '../../services/api';
import { Room, Inquiry } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get inquiry status color - extracted from nested ternary
const getInquiryStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
  if (status === 'pending') return 'warning';
  if (status === 'accepted') return 'success';
  if (status === 'declined') return 'error';
  if (status === 'rejected') return 'error';
  return 'default';
};

const RenterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data state
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'renter') {
        navigate('/');
      } else {
        fetchMyInquiries();
        fetchRecentRooms();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const fetchMyInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const res = await inquiriesAPI.getUserInquiries();
      setMyInquiries(res.data.data);
    } catch (e: any) {
      console.error('Failed to load inquiries:', e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const fetchRecentRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await roomsAPI.getRooms({ page: 1, limit: 6 });
      setRecentRooms(res.data.data);
    } catch (e: any) {
      console.error('Failed to load recent rooms:', e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const res = await roomsAPI.getRooms({ 
        search: searchQuery,
        page: 1,
        limit: 10
      });
      setSearchResults(res.data.data);
    } catch (e: any) {
      setError('Failed to search rooms');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate dashboard stats
  const totalInquiries = myInquiries.length;
  const pendingInquiries = myInquiries.filter(inq => inq.status === 'pending').length;
  const acceptedInquiries = myInquiries.filter(inq => inq.status === 'accepted').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Renter Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/')}
          size="large"
        >
          Browse Rooms
        </Button>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totalInquiries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Inquiries
                  </Typography>
                </Box>
                <MessageIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {pendingInquiries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Pending
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {acceptedInquiries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Accepted
                  </Typography>
                </Box>
                <FavoriteIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {recentRooms.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Available Rooms
                  </Typography>
                </Box>
                <HomeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="My Inquiries" />
          <Tab label="Search Rooms" />
          <Tab label="Recent Rooms" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* My Inquiries Tab */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {loadingInquiries ? (
            <Typography>Loading inquiries...</Typography>
          ) : myInquiries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No inquiries yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start browsing rooms and send inquiries to owners
              </Typography>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/')}
              >
                Browse Rooms
              </Button>
            </Box>
          ) : (
            <List>
              {myInquiries.map((inquiry) => (
                <ListItem key={inquiry._id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <HomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Inquiry for: ${inquiry.room?.title}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          To: {inquiry.owner?.name} ({inquiry.owner?.email})
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Your message: {inquiry.message}
                        </Typography>
                        {inquiry.ownerResponse && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Owner's response: {inquiry.ownerResponse}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={inquiry.status}
                            color={getInquiryStatusColor(inquiry.status)}
                            size="small"
                          />
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => navigate(`/rooms/${inquiry.room?._id}`)}
                          >
                            View Room
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Search Rooms Tab */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search for rooms by location, type, or amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      disabled={searchLoading}
                    >
                      {searchLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {searchResults.length > 0 ? (
            <Grid container spacing={3}>
              {searchResults.map((room) => (
                <Grid item xs={12} md={6} lg={4} key={room._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {room.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {room.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip label={`$${room.price}/month`} color="primary" />
                        <Chip label={room.roomType} variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        📍 {room.location?.city}, {room.location?.state}
                      </Typography>
                      {room.amenities && room.amenities.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {room.amenities.slice(0, 3).map((amenity, idx) => (
                              <Chip key={idx} label={amenity} size="small" variant="outlined" />
                            ))}
                            {room.amenities.length > 3 && (
                              <Chip label={`+${room.amenities.length - 3} more`} size="small" />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => navigate(`/rooms/${room._id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : searchQuery && !searchLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No rooms found
              </Typography>
              <Typography color="text.secondary">
                Try searching with different keywords
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Search for Rooms
              </Typography>
              <Typography color="text.secondary">
                Enter keywords to find your perfect room
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Recent Rooms Tab */}
          {loadingRooms ? (
            <Typography>Loading rooms...</Typography>
          ) : recentRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No rooms available
              </Typography>
              <Typography color="text.secondary">
                Check back later for new listings
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {recentRooms.map((room) => (
                <Grid item xs={12} md={6} lg={4} key={room._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {room.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {room.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip label={`$${room.price}/month`} color="primary" />
                        <Chip label={room.roomType} variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        📍 {room.location?.city}, {room.location?.state}
                      </Typography>
                      {room.amenities && room.amenities.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {room.amenities.slice(0, 3).map((amenity, idx) => (
                              <Chip key={idx} label={amenity} size="small" variant="outlined" />
                            ))}
                            {room.amenities.length > 3 && (
                              <Chip label={`+${room.amenities.length - 3} more`} size="small" />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => navigate(`/rooms/${room._id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default RenterDashboard;