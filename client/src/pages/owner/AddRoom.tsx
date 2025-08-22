import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { roomsAPI } from '../../services/api';

const steps = [
  'Basic Information',
  'Location Details',
  'Amenities & Features',
  'Photos & Final Review'
];

const commonAmenities = [
  'WiFi', 'Kitchen', 'Parking', 'Laundry', 'Air Conditioning', 'Heating',
  'Furnished', 'Pet Friendly', 'Gym Access', 'Swimming Pool', 'Balcony',
  'Garden', 'Security', 'Elevator', 'Storage'
];

const AddRoom: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [roomType, setRoomType] = useState<'single' | 'double' | 'shared' | 'studio' | 'apartment'>('single');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'owner') {
        navigate('/');
      }
    }
  }, [loading, user, navigate]);

  const handleNext = () => {
    setError('');
    
    // Validation for each step
    if (activeStep === 0) {
      if (!title || !description || !price) {
        setError('Please fill in all basic information fields.');
        return;
      }
    } else if (activeStep === 1) {
      if (!address || !city || !state || !zipCode) {
        setError('Please fill in all location fields.');
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages(files);
      
      // Create preview URLs
      const previews: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setImagePreview(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    if (images) {
      const newFiles = Array.from(images).filter((_, i) => i !== index);
      const dt = new DataTransfer();
      newFiles.forEach(file => dt.items.add(file));
      setImages(dt.files);
      setImagePreview(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', String(Number(price)));
    formData.append('roomType', roomType);
    formData.append('location.address', address);
    formData.append('location.city', city);
    formData.append('location.state', state);
    formData.append('location.zipCode', zipCode);

    // Combine selected amenities with custom ones
    const allAmenities = [...selectedAmenities];
    if (customAmenities) {
      const customList = customAmenities.split(',').map(a => a.trim()).filter(Boolean);
      allAmenities.push(...customList);
    }
    
    allAmenities.forEach((amenity, idx) => {
      formData.append(`amenities[${idx}]`, amenity);
    });

    if (images && images.length > 0) {
      Array.from(images).forEach((file) => formData.append('images', file));
    }

    try {
      setSubmitting(true);
      const res = await roomsAPI.createRoom(formData);
      setSuccess('Room created successfully!');
      
      // Redirect to room detail or dashboard after a short delay
      setTimeout(() => {
        navigate(`/rooms/${res.data.data._id}`);
      }, 2000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Room Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="e.g., Cozy Single Room in Downtown"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Describe your room, its features, and what makes it special..."
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monthly Rent ($)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Room Type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  fullWidth
                  required
                >
                  <MenuItem value="single">Single Room</MenuItem>
                  <MenuItem value="double">Double Room</MenuItem>
                  <MenuItem value="shared">Shared Room</MenuItem>
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              label="Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              required
              placeholder="123 Main Street"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="ZIP Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Select Amenities</Typography>
            <FormGroup>
              <Grid container spacing={1}>
                {commonAmenities.map((amenity) => (
                  <Grid item xs={12} sm={6} md={4} key={amenity}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                        />
                      }
                      label={amenity}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
            <TextField
              label="Additional Amenities (comma separated)"
              value={customAmenities}
              onChange={(e) => setCustomAmenities(e.target.value)}
              fullWidth
              placeholder="e.g., Dishwasher, Microwave, Study Desk"
              helperText="Add any amenities not listed above"
            />
            {(selectedAmenities.length > 0 || customAmenities) && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Amenities:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedAmenities.map((amenity) => (
                    <Chip key={amenity} label={amenity} size="small" />
                  ))}
                  {customAmenities && customAmenities.split(',').map((amenity, idx) => (
                    <Chip key={`custom-${idx}`} label={amenity.trim()} size="small" color="secondary" />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Photos
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {imagePreview.length > 0 && (
                <Grid container spacing={2}>
                  {imagePreview.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                          }}
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Listing
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={`$${price}/month`} color="primary" size="small" />
                  <Chip label={roomType} variant="outlined" size="small" />
                </Box>
                <Typography variant="body2">
                  📍 {address}, {city}, {state} {zipCode}
                </Typography>
                {(selectedAmenities.length > 0 || customAmenities) && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Amenities: {[...selectedAmenities, ...customAmenities.split(',').map(a => a.trim()).filter(Boolean)].join(', ')}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/owner/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Add New Room
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {getStepContent(index)}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      {index === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={submitting}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          {submitting ? 'Creating Room...' : 'Create Room'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Continue
                        </Button>
                      )}
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddRoom;