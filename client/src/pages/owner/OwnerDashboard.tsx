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
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
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
  return 'default';
};

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data state
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'owner') {
        navigate('/');
      } else {
        fetchMyRooms();
        fetchInquiries();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const fetchMyRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await roomsAPI.getOwnerRooms();
      setMyRooms(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load your rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const res = await inquiriesAPI.getOwnerInquiries();
      setInquiries(res.data.data);
    } catch (e: any) {
      console.error('Failed to load inquiries:', e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomsAPI.deleteRoom(roomId);
        setSuccess('Room deleted successfully.');
        fetchMyRooms();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate dashboard stats
  const totalRooms = myRooms.length;
  const totalRevenue = myRooms.reduce((sum, room) => sum + room.price, 0);
  const pendingInquiries = inquiries.filter(inq => inq.status === 'pending').length;
  const averagePrice = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Owner Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/owner/add-room')}
          size="large"
        >
          Add New Room
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
                    {totalRooms}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Rooms
                  </Typography>
                </Box>
                <HomeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    ${averagePrice}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg. Price
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {inquiries.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Inquiries
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {pendingInquiries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Pending
                  </Typography>
                </Box>
                <Badge badgeContent={pendingInquiries} color="error">
                  <NotificationsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="My Rooms" />
          <Tab label="Inquiries" />
          <Tab label="Analytics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* My Rooms Tab */}
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

          {loadingRooms ? (
            <Typography>Loading rooms...</Typography>
          ) : myRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No rooms yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start by adding your first room to attract renters
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/owner/add-room')}
              >
                Add Your First Room
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {myRooms.map((room) => (
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
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/rooms/${room._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          color="secondary"
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDeleteRoom(room._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Inquiries Tab */}
          {loadingInquiries ? (
            <Typography>Loading inquiries...</Typography>
          ) : inquiries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No inquiries yet
              </Typography>
              <Typography color="text.secondary">
                Inquiries from potential renters will appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {inquiries.map((inquiry) => (
                <ListItem key={inquiry._id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      {inquiry.inquirer?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Inquiry for: ${inquiry.room?.title}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          From: {inquiry.inquirer?.name} ({inquiry.inquirer?.email})
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {inquiry.message}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={inquiry.status}
                            color={getInquiryStatusColor(inquiry.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Analytics Tab */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Room Type Distribution
                  </Typography>
                  {myRooms.length > 0 ? (
                    <Box>
                      {['single', 'double', 'shared', 'studio', 'apartment'].map((type) => {
                        const count = myRooms.filter(room => room.roomType === type).length;
                        const percentage = Math.round((count / myRooms.length) * 100);
                        return count > 0 ? (
                          <Box key={type} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {type}
                              </Typography>
                              <Typography variant="body2">
                                {count} ({percentage}%)
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: 'grey.200',
                                borderRadius: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: 'primary.main',
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Box>
                        ) : null;
                      })}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Price Range Analysis
                  </Typography>
                  {myRooms.length > 0 ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Lowest Price:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${Math.min(...myRooms.map(r => r.price))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Highest Price:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${Math.max(...myRooms.map(r => r.price))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Average Price:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${averagePrice}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default OwnerDashboard;