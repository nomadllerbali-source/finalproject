import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Sightseeing, VehicleCost, PersonBasedOption, Area, LocationVehicleCost } from '../../types';
import { MapPin, Plus, Edit2, Trash2, Save, X, Search, Car, Ticket, Users } from 'lucide-react';
import Layout from '../Layout';
import { supabase } from '../../lib/supabase';

const SightseeingManager: React.FC = () => {
  const { state, addSightseeing, updateSightseeingData, deleteSightseeingData } = useData();
  const { sightseeings, transportations, entryTickets } = state;
  const [areas, setAreas] = useState<Area[]>([]);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sightseeing>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [entryTicketSearchTerm, setEntryTicketSearchTerm] = useState('');
  const [editEntryTicketSearchTerm, setEditEntryTicketSearchTerm] = useState('');
  const [newSightseeing, setNewSightseeing] = useState<Omit<Sightseeing, 'id'>>({
    name: '',
    displayName: '',
    description: '',
    transportationMode: 'cab',
    vehicleCosts: {},
    vehicleCostsByLocation: [],
    personBasedOptions: [],
    entryTicketIds: [],
    pickupLocations: [],
    areaId: '',
    areaName: ''
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchAreas();
    initializeVehicleCosts();
  }, [transportations]);

  const initializeVehicleCosts = () => {
    const cabVehicles = transportations.filter(t => t.type === 'cab');
    const initialCosts: VehicleCost = {};
    cabVehicles.forEach(vehicle => {
      initialCosts[vehicle.vehicleName] = 0;
    });
    setNewSightseeing(prev => ({
      ...prev,
      vehicleCosts: initialCosts
    }));
  };

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const filteredSightseeings = sightseeings.filter(sight => {
    const matchesArea = filterArea === 'all' || sight.areaId === filterArea;
    const matchesSearch =
      sight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sight.areaName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const handleAdd = async () => {
    if (!newSightseeing.areaId) {
      alert('Please select an area first');
      return;
    }

    const transportationModes = ['cab', 'self-drive-car', 'self-drive-scooter'];

    for (const mode of transportationModes) {
      const sightseeing: Sightseeing = {
        id: `${Date.now()}-${mode}`,
        name: newSightseeing.name,
        displayName: newSightseeing.displayName,
        description: newSightseeing.description,
        transportationMode: mode as 'cab' | 'self-drive-car' | 'self-drive-scooter',
        vehicleCosts: mode === 'cab' ? newSightseeing.vehicleCosts : undefined,
        vehicleCostsByLocation: mode === 'cab' ? newSightseeing.vehicleCostsByLocation : undefined,
        personBasedOptions: mode === 'cab' ? newSightseeing.personBasedOptions : undefined,
        entryTicketIds: mode === 'cab' ? newSightseeing.entryTicketIds : undefined,
        pickupLocations: newSightseeing.pickupLocations,
        areaId: newSightseeing.areaId,
        areaName: newSightseeing.areaName
      };
      await addSightseeing(sightseeing);
    }

    const cabVehicles = transportations.filter(t => t.type === 'cab');
    const initialCosts: VehicleCost = {};
    cabVehicles.forEach(vehicle => {
      initialCosts[vehicle.vehicleName] = 0;
    });
    setNewSightseeing({
      name: '',
      displayName: '',
      description: '',
      transportationMode: 'cab',
      vehicleCosts: initialCosts,
      vehicleCostsByLocation: [],
      personBasedOptions: [],
      entryTicketIds: [],
      pickupLocations: [],
      areaId: '',
      areaName: ''
    });
    setEntryTicketSearchTerm('');
    setShowAddForm(false);
    setShowLocationPicker(false);
    setSelectedLocation('');
  };

  const handleEdit = (sightseeing: Sightseeing) => {
    setIsEditing(sightseeing.id);
    setEditEntryTicketSearchTerm('');

    if (sightseeing.transportationMode === 'cab') {
      const cabVehicles = transportations.filter(t => t.type === 'cab');
      const updatedCosts = { ...sightseeing.vehicleCosts };

      cabVehicles.forEach(vehicle => {
        if (!(vehicle.vehicleName in updatedCosts)) {
          updatedCosts[vehicle.vehicleName] = 0;
        }
      });

      setEditForm({ ...sightseeing, vehicleCosts: updatedCosts });
    } else {
      setEditForm(sightseeing);
    }
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateSightseeingData(editForm as Sightseeing);
      setIsEditing(null);
      setEditForm({});
      setEditEntryTicketSearchTerm('');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sightseeing spot?')) {
      await deleteSightseeingData(id);
    }
  };

  const updateVehicleCost = (vehicleName: string, value: number, isNew: boolean = false) => {
    if (isNew) {
      setNewSightseeing({
        ...newSightseeing,
        vehicleCosts: {
          ...newSightseeing.vehicleCosts!,
          [vehicleName]: value
        }
      });
    } else if (editForm.vehicleCosts) {
      setEditForm({
        ...editForm,
        vehicleCosts: {
          ...editForm.vehicleCosts,
          [vehicleName]: value
        }
      });
    }
  };


  const isNusaPenidaArea = (areaName?: string) => {
    return areaName?.toLowerCase().includes('nusa penida');
  };

  const getFilteredEntryTickets = (areaId?: string) => {
    if (!areaId) return [];
    return entryTickets.filter(ticket => ticket.areaId === areaId);
  };

  const toggleEntryTicket = (ticketId: string, isNew: boolean = false) => {
    if (isNew) {
      const currentIds = newSightseeing.entryTicketIds || [];
      const updatedIds = currentIds.includes(ticketId)
        ? currentIds.filter(id => id !== ticketId)
        : [...currentIds, ticketId];
      setNewSightseeing({
        ...newSightseeing,
        entryTicketIds: updatedIds
      });
    } else {
      const currentIds = editForm.entryTicketIds || [];
      const updatedIds = currentIds.includes(ticketId)
        ? currentIds.filter(id => id !== ticketId)
        : [...currentIds, ticketId];
      setEditForm({
        ...editForm,
        entryTicketIds: updatedIds
      });
    }
  };

  const renderLocationBasedVehicleCosts = (isNew: boolean = false) => {
    const vehicleCostsByLocation = isNew ? newSightseeing.vehicleCostsByLocation || [] : editForm.vehicleCostsByLocation || [];
    const cabVehicles = transportations.filter(t => t.type === 'cab');
    const availableLocations = ['Kuta', 'Ubud', 'Kitamani'];

    const addLocationVehicleCosts = (location: string) => {
      const initialCosts: Record<string, number> = {};
      cabVehicles.forEach(vehicle => {
        initialCosts[vehicle.vehicleName] = 0;
      });

      const newLocationCost: LocationVehicleCost = {
        location,
        costs: initialCosts
      };

      if (isNew) {
        setNewSightseeing({
          ...newSightseeing,
          vehicleCostsByLocation: [...vehicleCostsByLocation, newLocationCost]
        });
      } else {
        setEditForm({
          ...editForm,
          vehicleCostsByLocation: [...vehicleCostsByLocation, newLocationCost]
        });
      }
      setShowLocationPicker(false);
      setSelectedLocation('');
    };

    const updateLocationVehicleCost = (locationIndex: number, vehicleName: string, cost: number) => {
      const updated = [...vehicleCostsByLocation];
      updated[locationIndex].costs[vehicleName] = cost;

      if (isNew) {
        setNewSightseeing({ ...newSightseeing, vehicleCostsByLocation: updated });
      } else {
        setEditForm({ ...editForm, vehicleCostsByLocation: updated });
      }
    };

    const removeLocationVehicleCosts = (locationIndex: number) => {
      const updated = vehicleCostsByLocation.filter((_, idx) => idx !== locationIndex);
      if (isNew) {
        setNewSightseeing({ ...newSightseeing, vehicleCostsByLocation: updated });
      } else {
        setEditForm({ ...editForm, vehicleCostsByLocation: updated });
      }
    };

    const usedLocations = vehicleCostsByLocation.map(lvc => lvc.location);
    const remainingLocations = availableLocations.filter(loc => !usedLocations.includes(loc));

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">
            <MapPin className="h-4 w-4 inline mr-1" />
            Location-Based Vehicle Costs
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Add vehicle costs for different pickup locations. Each location can have different pricing.
          </p>
        </div>

        {vehicleCostsByLocation.map((locationCost, locationIndex) => (
          <div key={locationIndex} className="bg-white border-2 border-slate-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Pickup from {locationCost.location}
              </h5>
              <button
                onClick={() => removeLocationVehicleCosts(locationIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cabVehicles.map(vehicle => (
                <div key={vehicle.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {vehicle.vehicleName} (Rp)
                    <span className="text-xs text-slate-500 block">
                      {vehicle.minOccupancy}-{vehicle.maxOccupancy} pax
                    </span>
                  </label>
                  <input
                    type="number"
                    value={locationCost.costs[vehicle.vehicleName] || 0}
                    onChange={(e) => updateLocationVehicleCost(locationIndex, vehicle.vehicleName, parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {remainingLocations.length > 0 && (
          <div>
            {!showLocationPicker ? (
              <button
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle Costs for Location
              </button>
            ) : (
              <div className="bg-slate-50 border-2 border-blue-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Pickup Location
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose location...</option>
                    {remainingLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedLocation) {
                        addLocationVehicleCosts(selectedLocation);
                      }
                    }}
                    disabled={!selectedLocation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowLocationPicker(false);
                      setSelectedLocation('');
                    }}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {vehicleCostsByLocation.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No location-based vehicle costs added yet. Click "Add Vehicle Costs for Location" to start.
          </div>
        )}
      </div>
    );
  };

  const renderVehicleCostInputs = (vehicleCosts: VehicleCost | undefined, isNew: boolean = false, areaName?: string) => {
    if (!vehicleCosts) return null;

    const isNusaPenida = isNusaPenidaArea(areaName);
    const cabVehicles = transportations.filter(t => t.type === 'cab');

    if (cabVehicles.length === 0) {
      return (
        <div className="text-slate-500 text-sm">
          No cab vehicles found. Please add vehicles in the Transportation Manager first.
        </div>
      );
    }

    if (isNusaPenida) {
      const pickupLocations = ['Kuta', 'Ubud', 'Kitamnai'];
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">
              <MapPin className="h-4 w-4 inline mr-1" />
              Nusa Penida Special Pricing
            </p>
            <p className="text-xs text-blue-700 mt-1">
              For Nusa Penida tours, enter vehicle costs for each pickup location.
            </p>
          </div>

          {cabVehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-3 flex items-center">
                <Car className="h-4 w-4 mr-2 text-blue-600" />
                {vehicle.vehicleName} ({vehicle.minOccupancy}-{vehicle.maxOccupancy} pax)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pickupLocations.map(location => {
                  const key = `${vehicle.vehicleName}_${location}`;
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pickup from {location} (Rp)
                      </label>
                      <input
                        type="number"
                        value={vehicleCosts[key] || 0}
                        onChange={(e) => updateVehicleCost(key, parseFloat(e.target.value) || 0, isNew)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabVehicles.map(vehicle => (
          <div key={vehicle.id}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {vehicle.vehicleName} Cost (Rp)
              <span className="text-xs text-slate-500 block">
                {vehicle.minOccupancy}-{vehicle.maxOccupancy} pax
              </span>
            </label>
            <input
              type="number"
              value={vehicleCosts[vehicle.vehicleName] || 0}
              onChange={(e) => updateVehicleCost(vehicle.vehicleName, parseFloat(e.target.value) || 0, isNew)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderPersonBasedOptions = (options: PersonBasedOption[] | undefined, isNew: boolean = false, areaName?: string) => {
    if (!isNusaPenidaArea(areaName)) return null;

    const vehicleCosts = isNew ? newSightseeing.vehicleCosts || {} : editForm.vehicleCosts || {};

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-medium flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Trip Cost Per Person
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Enter the cost per person for different group sizes (1-6 persons)
          </p>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Cost Per Person (Rp)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(count => (
              <div key={count}>
                <label className="block text-xs text-slate-600 mb-1 font-medium">
                  {count} {count === 1 ? 'Person' : 'Persons'}
                </label>
                <input
                  type="number"
                  value={vehicleCosts[`${count}_person`] || 0}
                  onChange={(e) => {
                    const newCosts = { ...vehicleCosts, [`${count}_person`]: parseFloat(e.target.value) || 0 };
                    if (isNew) {
                      setNewSightseeing(prev => ({ ...prev, vehicleCosts: newCosts }));
                    } else {
                      setEditForm(prev => ({ ...prev, vehicleCosts: newCosts }));
                    }
                  }}
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEntryTicketSelection = (areaId: string | undefined, selectedTicketIds: string[] | undefined, isNew: boolean = false) => {
    if (!areaId) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            Please select an area first to see available entry tickets.
          </p>
        </div>
      );
    }

    const availableTickets = getFilteredEntryTickets(areaId);

    if (availableTickets.length === 0) {
      return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-slate-600 text-sm">
            No entry tickets available for this area. Add entry tickets in the Entry Ticket Manager first.
          </p>
        </div>
      );
    }

    const searchTerm = isNew ? entryTicketSearchTerm : editEntryTicketSearchTerm;
    const filteredTickets = availableTickets.filter(ticket =>
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Select entry tickets that are included with this sightseeing tour:
          </p>
          <div className="relative w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => isNew ? setEntryTicketSearchTerm(e.target.value) : setEditEntryTicketSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
            <p className="text-slate-600 text-sm">
              No entry tickets found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <label
              key={ticket.id}
              className="flex items-start space-x-3 p-3 border-2 border-slate-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={selectedTicketIds?.includes(ticket.id) || false}
                onChange={() => toggleEntryTicket(ticket.id, isNew)}
                className="mt-1 h-5 w-5 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{ticket.name}</div>
                <div className="text-sm text-slate-600 mt-1">
                  Adult: Rp {ticket.adultCost.toLocaleString('id-ID')} |
                  Child: Rp {ticket.childCost.toLocaleString('id-ID')}
                </div>
              </div>
            </label>
          ))
        )}
      </div>
    );
  };

  return (
    <Layout title="Sightseeing Management" subtitle="Manage sightseeing spots and transportation costs" hideHeader={true}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Sightseeing Management</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sightseeing spots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sightseeing
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Area *
                  </label>
                  <select
                    value={newSightseeing.areaId}
                    onChange={(e) => {
                      const selectedArea = areas.find(a => a.id === e.target.value);
                      const areaName = selectedArea?.name || '';

                      let initialCosts: VehicleCost = {};
                      let initialVehicleCostsByLocation: LocationVehicleCost[] = [];

                      if (isNusaPenidaArea(areaName)) {
                        // Find existing Nusa Penida sightseeing with vehicle costs
                        const existingNusaPenidaSightseeing = sightseeings.find(s =>
                          isNusaPenidaArea(s.areaName) &&
                          s.transportationMode === 'cab' &&
                          s.vehicleCostsByLocation &&
                          s.vehicleCostsByLocation.length > 0
                        );

                        if (existingNusaPenidaSightseeing && existingNusaPenidaSightseeing.vehicleCostsByLocation) {
                          // Copy the vehicle costs from existing sightseeing
                          initialVehicleCostsByLocation = JSON.parse(JSON.stringify(existingNusaPenidaSightseeing.vehicleCostsByLocation));
                        }
                      } else {
                        const cabVehicles = transportations.filter(t => t.type === 'cab');
                        cabVehicles.forEach(vehicle => {
                          initialCosts[vehicle.vehicleName] = 0;
                        });
                      }

                      setNewSightseeing({
                        ...newSightseeing,
                        areaId: e.target.value,
                        areaName: areaName,
                        vehicleCosts: initialCosts,
                        vehicleCostsByLocation: initialVehicleCostsByLocation
                      });
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select area first...</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sightseeing Name (Internal)
                  </label>
                  <input
                    type="text"
                    value={newSightseeing.name}
                    onChange={(e) => setNewSightseeing({ ...newSightseeing, name: e.target.value })}
                    placeholder="Enter internal reference name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transportation Mode
                  </label>
                  <select
                    value={newSightseeing.transportationMode}
                    onChange={(e) => setNewSightseeing({
                      ...newSightseeing,
                      transportationMode: e.target.value as 'cab' | 'self-drive-car' | 'self-drive-scooter'
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cab">Cab</option>
                    <option value="self-drive-car">Self-drive Car</option>
                    <option value="self-drive-scooter">Self-drive Scooter</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name (Shown in Itinerary) *
                  <span className="text-xs text-slate-500 block mt-1">This will appear as a bold heading in the day-by-day itinerary</span>
                </label>
                <input
                  type="text"
                  value={newSightseeing.displayName}
                  onChange={(e) => setNewSightseeing({ ...newSightseeing, displayName: e.target.value })}
                  placeholder="Enter the name to display in itinerary (e.g., 'Ubud Rice Terraces Visit')"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                  <span className="text-xs text-slate-500 block mt-1">Details shown below the display name in the itinerary</span>
                </label>
                <textarea
                  value={newSightseeing.description}
                  onChange={(e) => setNewSightseeing({ ...newSightseeing, description: e.target.value })}
                  placeholder="Enter description of the sightseeing spot"
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {newSightseeing.transportationMode === 'cab' && (
                <>
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                      <Car className="h-4 w-4 mr-2 text-blue-600" />
                      Vehicle Costs (for Cab mode)
                    </h4>
                    {isNusaPenidaArea(newSightseeing.areaName) ? (
                      <>
                        {newSightseeing.vehicleCostsByLocation && newSightseeing.vehicleCostsByLocation.length > 0 && (
                          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800 font-medium">
                              Vehicle costs pre-populated from existing Nusa Penida sightseeing. You can modify as needed.
                            </p>
                          </div>
                        )}
                        {renderLocationBasedVehicleCosts(true)}
                      </>
                    ) : (
                      renderVehicleCostInputs(newSightseeing.vehicleCosts, true, newSightseeing.areaName)
                    )}
                  </div>

                  {isNusaPenidaArea(newSightseeing.areaName) && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-purple-600" />
                        Person-Based Options (Optional - for Nusa Penida only)
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Create custom tour options with different costs based on number of persons. All costs are per person.
                      </p>
                      {renderPersonBasedOptions(newSightseeing.personBasedOptions, true, newSightseeing.areaName)}
                    </div>
                  )}

                  {!isNusaPenidaArea(newSightseeing.areaName) && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                        <Ticket className="h-4 w-4 mr-2 text-teal-600" />
                        Entry Tickets (Optional - for Cab mode only)
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Select entry tickets that should be automatically included when this sightseeing is selected in an itinerary.
                      </p>
                      {renderEntryTicketSelection(newSightseeing.areaId, newSightseeing.entryTicketIds, true)}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEntryTicketSearchTerm('');
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newSightseeing.name || !newSightseeing.description}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Sightseeing
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search sightseeing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Areas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSightseeings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm ? 'No sightseeing spots found' : 'No sightseeing spots yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Add your first sightseeing spot to get started.'
                }
              </p>
            </div>
          ) : (
            filteredSightseeings.map((sight) => (
              <div key={sight.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                {isEditing === sight.id ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Area *
                        </label>
                        <select
                          value={editForm.areaId}
                          onChange={(e) => {
                            const selectedArea = areas.find(a => a.id === e.target.value);
                            const areaName = selectedArea?.name || '';

                            let initialCosts: VehicleCost = {};
                            if (isNusaPenidaArea(areaName)) {
                              const cabVehicles = transportations.filter(t => t.type === 'cab');
                              const pickupLocations = ['Kuta', 'Ubud', 'Kitamnai'];
                              cabVehicles.forEach(vehicle => {
                                pickupLocations.forEach(location => {
                                  initialCosts[`${vehicle.vehicleName}_${location}`] = 0;
                                });
                              });
                            } else {
                              const cabVehicles = transportations.filter(t => t.type === 'cab');
                              cabVehicles.forEach(vehicle => {
                                initialCosts[vehicle.vehicleName] = 0;
                              });
                            }

                            setEditForm({
                              ...editForm,
                              areaId: e.target.value,
                              areaName: areaName,
                              vehicleCosts: initialCosts
                            });
                          }}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        >
                          <option value="">Select area...</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Sightseeing Name (Internal)
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Transportation Mode
                        </label>
                        <select
                          value={editForm.transportationMode}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            transportationMode: e.target.value as 'cab' | 'self-drive-car' | 'self-drive-scooter'
                          })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        >
                          <option value="cab">Cab</option>
                          <option value="self-drive-car">Self-drive Car</option>
                          <option value="self-drive-scooter">Self-drive Scooter</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Display Name (Shown in Itinerary) *
                        <span className="text-xs text-slate-500 block mt-1">This will appear as a bold heading in the day-by-day itinerary</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName || ''}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        placeholder="Enter the name to display in itinerary"
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                        <span className="text-xs text-slate-500 block mt-1">Details shown below the display name in the itinerary</span>
                      </label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                    </div>

                    {editForm.transportationMode === 'cab' && (
                      <>
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                            <Car className="h-4 w-4 mr-2 text-blue-600" />
                            Vehicle Costs (for Cab mode)
                          </h4>
                          {isNusaPenidaArea(editForm.areaName) ? (
                            renderLocationBasedVehicleCosts(false)
                          ) : (
                            renderVehicleCostInputs(editForm.vehicleCosts, false, editForm.areaName)
                          )}
                        </div>

                        {isNusaPenidaArea(editForm.areaName) && (
                          <div className="mb-6">
                            <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-purple-600" />
                              Person-Based Options (Optional - for Nusa Penida only)
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">
                              Create custom tour options with different costs based on number of persons. All costs are per person.
                            </p>
                            {renderPersonBasedOptions(editForm.personBasedOptions, false, editForm.areaName)}
                          </div>
                        )}

                        {!isNusaPenidaArea(editForm.areaName) && (
                          <div className="mb-6">
                            <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                              <Ticket className="h-4 w-4 mr-2 text-teal-600" />
                              Entry Tickets (Optional - for Cab mode only)
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">
                              Select entry tickets that should be automatically included when this sightseeing is selected in an itinerary.
                            </p>
                            {renderEntryTicketSelection(editForm.areaId, editForm.entryTicketIds, false)}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsEditing(null);
                          setEditForm({});
                          setEditEntryTicketSearchTerm('');
                        }}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-900">{sight.name}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                <MapPin className="h-3 w-3 mr-1" />
                                {sight.areaName || 'No Area'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-slate-600">{sight.description}</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {sight.transportationMode.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(sight)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sight.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {sight.transportationMode === 'cab' && sight.vehicleCosts && (
                      <div className="p-6 border-b border-slate-200">
                        <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          {isNusaPenidaArea(sight.areaName) ? 'Vehicle Costs by Pickup Location' : 'Vehicle Costs'}
                        </h4>
                        {isNusaPenidaArea(sight.areaName) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-800">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Nusa Penida - Costs vary by vehicle type and pickup location
                            </p>
                          </div>
                        )}
                        {isNusaPenidaArea(sight.areaName) ? (
                          <div className="space-y-4">
                            {transportations.filter(t => t.type === 'cab').map(vehicle => {
                              const pickupLocations = ['Kuta', 'Ubud', 'Kitamnai'];
                              return (
                                <div key={vehicle.id} className="bg-slate-50 p-4 rounded-lg">
                                  <h5 className="font-semibold text-slate-900 mb-3 text-sm">
                                    {vehicle.vehicleName} ({vehicle.minOccupancy}-{vehicle.maxOccupancy} pax)
                                  </h5>
                                  <div className="grid grid-cols-3 gap-3">
                                    {pickupLocations.map(location => {
                                      const key = `${vehicle.vehicleName}_${location}`;
                                      const cost = sight.vehicleCosts?.[key] || 0;
                                      return (
                                        <div key={key} className="bg-white p-2 rounded border border-slate-200">
                                          <div className="text-xs text-slate-600">From {location}</div>
                                          <div className="text-sm font-bold text-slate-900">Rp {cost.toLocaleString('id-ID')}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(sight.vehicleCosts).map(([vehicleName, cost]) => {
                              const vehicle = transportations.find(t => t.vehicleName === vehicleName && t.type === 'cab');
                              return (
                                <div key={vehicleName} className="bg-slate-50 p-3 rounded-lg">
                                  <div className="text-sm font-medium text-slate-700">
                                    {vehicleName}
                                    {vehicle && ` (${vehicle.minOccupancy}-${vehicle.maxOccupancy} pax)`}
                                  </div>
                                  <div className="text-lg font-bold text-slate-900">Rp {cost.toLocaleString('id-ID')}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {sight.transportationMode === 'cab' && sight.personBasedOptions && sight.personBasedOptions.length > 0 && (
                      <div className="p-6 border-b border-slate-200">
                        <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                          Person-Based Options
                        </h4>
                        <div className="space-y-3">
                          {sight.personBasedOptions.map(option => (
                            <div key={option.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h5 className="font-semibold text-purple-900 mb-2">{option.name}</h5>
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {Object.entries(option.costPerPax).map(([count, cost]) => (
                                  <div key={count} className="bg-white p-2 rounded border border-purple-200">
                                    <div className="text-xs text-purple-600">{count} {count === '1' ? 'Person' : 'Persons'}</div>
                                    <div className="text-sm font-bold text-purple-900">Rp {cost.toLocaleString('id-ID')}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sight.transportationMode === 'cab' && sight.entryTicketIds && sight.entryTicketIds.length > 0 && (
                      <div className="p-6">
                        <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-teal-600" />
                          Included Entry Tickets ({sight.entryTicketIds.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sight.entryTicketIds.map(ticketId => {
                            const ticket = entryTickets.find(t => t.id === ticketId);
                            if (!ticket) return null;
                            return (
                              <div key={ticketId} className="bg-teal-50 border border-teal-200 p-3 rounded-lg">
                                <div className="font-medium text-teal-900">{ticket.name}</div>
                                <div className="text-sm text-teal-700 mt-1">
                                  Adult: Rp {ticket.adultCost.toLocaleString('id-ID')} |
                                  Child: Rp {ticket.childCost.toLocaleString('id-ID')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SightseeingManager;
