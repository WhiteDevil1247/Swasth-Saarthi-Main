import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Search, MapPin, Phone, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface Hospital {
  id: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  contact?: string;
  type?: string;
  beds?: number;
  lat?: number;
  lng?: number;
  distanceKm?: number;
}

export const HospitalNavigator = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([26.8467, 80.9462]); // Lucknow default

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      });
    }
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(radius && { 
          radiusKm: radius.toString(),
          lat: userLocation[0].toString(),
          lng: userLocation[1].toString()
        }),
      });
      
      const response = await fetch(`http://localhost:8081/api/hospitals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHospitals(data);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Hospital Navigator
        </motion.h1>

        {/* Search Controls */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter by hospital type"
            >
              <option value="">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Specialized">Specialized</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <label>Radius (km):</label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-1"
                aria-label="Search radius in kilometers"
                title={`Search radius: ${radius} km`}
              />
              <span className="text-sm font-medium">{radius}</span>
            </div>
            
            <motion.button
              onClick={fetchHospitals}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden h-[500px]"
            variants={itemVariants}
          >
            <MapContainer
              center={userLocation as LatLngExpression}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* User location marker */}
              <Marker position={userLocation as LatLngExpression}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
              
              {/* Hospital markers */}
              {hospitals.map((hospital) => {
                if (hospital.lat && hospital.lng) {
                  return (
                    <Marker key={hospital.id} position={[hospital.lat, hospital.lng] as LatLngExpression}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{hospital.name}</h3>
                          <p className="text-sm">{hospital.address}</p>
                          {hospital.contact && (
                            <p className="text-sm">📞 {hospital.contact}</p>
                          )}
                          {hospital.distanceKm && (
                            <p className="text-sm font-medium text-indigo-600">
                              {hospital.distanceKm.toFixed(1)} km away
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </motion.div>

          {/* Hospital List */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden h-[500px] overflow-y-auto"
            variants={itemVariants}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Nearby Hospitals ({hospitals.length})
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.map((hospital, index) => (
                    <motion.div
                      key={hospital.id}
                      className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {hospital.name}
                          </h3>
                          <div className="mt-2 space-y-1">
                            {hospital.address && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                                {hospital.address}
                              </p>
                            )}
                            {hospital.type && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-indigo-500" />
                                {hospital.type}
                              </p>
                            )}
                            {hospital.contact && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                                {hospital.contact}
                              </p>
                            )}
                          </div>
                        </div>
                        {hospital.distanceKm && (
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-indigo-600">
                              {hospital.distanceKm.toFixed(1)} km
                            </p>
                            <p className="text-xs text-gray-500">away</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
