import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, CarFront, Megaphone, LogOut, Plus, Pencil, Trash2, CheckCircle2, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { popupApi, uploadApi, vehicleApi } from '../services/api';
import type { Car, Popup } from '../types';
import { defaultBranchPopupSettings, getBranchPopupSettings, normalizeBranchPopupSettings, setBranchPopupSettings, type BranchPopupSettings } from '../utils/branchPopupSettings';

const vehicleFuelTypes: Car['fuel_type'][] = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const vehicleTransmissions: Car['transmission'][] = ['Manual', 'Automatic'];
const acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type View = 'dashboard' | 'fleet' | 'popup';
type PositionOption = 'after';

type VehicleFormState = {
  name: string;
  model: string;
  year: string;
  price_per_day: string;
  fuel_type: Car['fuel_type'];
  transmission: Car['transmission'];
  seats: string;
  description: string;
  availability: boolean;
  image: string;
  position: PositionOption;
  insertAfterId: string;
};

function createEmptyVehicleForm(): VehicleFormState {
  return {
    name: '',
    model: '',
    year: '',
    price_per_day: '',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: '',
    description: '',
    availability: true,
    image: '',
    position: 'after',
    insertAfterId: '',
  };
}

function createEmptyPopupForm(): BranchPopupSettings {
  return {
    enabled: true,
    title: '',
    subtitle: '',
    description: '',
    image: '',
  };
}

function settingsToPopup(settings: BranchPopupSettings): Popup {
  return {
    id: settings.id || '',
    title: settings.title,
    subtitle: settings.subtitle,
    description: settings.description,
    image: settings.image || '',
    enabled: settings.enabled,
  };
}

function popupToSettings(popup: Popup): BranchPopupSettings {
  return normalizeBranchPopupSettings({
    id: String(popup.id || popup._id || ''),
    enabled: popup.enabled,
    title: popup.title,
    subtitle: popup.subtitle,
    description: popup.description,
    image: popup.image || '',
  });
}

function getVehicleLabel(vehicle: Car) {
  const year = vehicle.yearRange || vehicle.year;
  return year ? `${vehicle.name} (${year})` : vehicle.name;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(createEmptyVehicleForm());
  const [vehicleImageUploading, setVehicleImageUploading] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [popupForm, setPopupForm] = useState<BranchPopupSettings>(getBranchPopupSettings());
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [popupImageUploading, setPopupImageUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadVehicles();
    loadPopups();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function loadVehicles() {
    try {
      const list = await vehicleApi.list();
      setVehicles((list || []).filter(vehicle => !vehicle.isDeleted));
    } catch {
      setToast('Unable to load vehicles right now.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPopups() {
    try {
      const list = await popupApi.list();
      setPopups(list || []);
      const current = (list || []).find(popup => popup.enabled) || (list || [])[0];
      if (current) {
        const settings = popupToSettings(current);
        setPopupForm(settings);
        setBranchPopupSettings(settings);
        setEditingPopupId(settings.id || null);
        return;
      }

      const fallback = getBranchPopupSettings();
      setPopupForm(fallback.enabled ? fallback : defaultBranchPopupSettings);
      setEditingPopupId(null);
    } catch {
      const fallback = getBranchPopupSettings();
      setPopupForm(fallback.enabled ? fallback : defaultBranchPopupSettings);
      setEditingPopupId(fallback.id || null);
    }
  }

  function resetVehicleForm() {
    setVehicleForm(createEmptyVehicleForm());
    setEditingVehicleId(null);
  }

  function resetPopupForm() {
    setPopupForm(createEmptyPopupForm());
    setEditingPopupId(null);
    setShowPopupForm(true);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>, target: 'vehicle' | 'popup') {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!acceptedImageTypes.includes(file.type)) {
      setToast('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    try {
      if (target === 'vehicle') setVehicleImageUploading(true);
      else setPopupImageUploading(true);

      const uploaded = await uploadApi.image(file, target === 'vehicle' ? 'vehicles' : 'popups');
      if (target === 'vehicle') {
        setVehicleForm(prev => ({ ...prev, image: uploaded.url }));
      } else {
        setPopupForm(prev => ({ ...prev, image: uploaded.url }));
      }
      setToast('Image uploaded successfully.');
    } catch {
      setToast('Unable to upload image.');
    } finally {
      setVehicleImageUploading(false);
      setPopupImageUploading(false);
    }
  }

  function getPreviousVehicleId(id: string) {
    const index = vehicles.findIndex(vehicle => String(vehicle.id) === id);
    if (index > 0) return String(vehicles[index - 1].id);
    return '';
  }

  async function handleVehicleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!vehicleForm.name || !vehicleForm.model || !vehicleForm.year || !vehicleForm.price_per_day || !vehicleForm.seats) {
      setToast('Please fill all required vehicle fields.');
      return;
    }

    if (!editingVehicleId && vehicles.length > 0 && !vehicleForm.insertAfterId) {
      setToast('Choose which vehicle this should appear after.');
      return;
    }

    try {
      const payload = {
        name: vehicleForm.name.trim(),
        brand: vehicleForm.model.split(' ')[0] || 'Classic Car',
        model: vehicleForm.model.trim(),
        year: /^\d+$/.test(vehicleForm.year.trim()) ? Number(vehicleForm.year) : vehicleForm.year.trim(),
        yearRange: vehicleForm.year.trim(),
        price_per_day: Number(vehicleForm.price_per_day),
        fuel_type: vehicleForm.fuel_type,
        transmission: vehicleForm.transmission,
        seats: Number(vehicleForm.seats),
        description: vehicleForm.description.trim(),
        availability: vehicleForm.availability,
        status: (vehicleForm.availability ? 'available' : 'maintenance') as Car['status'],
        category: 'Sedan' as Car['category'],
        images: vehicleForm.image ? [vehicleForm.image] : [],
        features: [],
        position: vehicleForm.position,
        insertAfterId: vehicleForm.insertAfterId,
      };

      if (editingVehicleId) {
        await vehicleApi.update(editingVehicleId, payload);
        setToast('Vehicle updated successfully.');
      } else {
        await vehicleApi.create(payload);
        setToast('Vehicle added successfully.');
      }

      resetVehicleForm();
      await loadVehicles();
    } catch {
      setToast(editingVehicleId ? 'Unable to update vehicle.' : 'Unable to add vehicle.');
    }
  }

  function handleEditVehicle(id: string) {
    const target = vehicles.find(vehicle => String(vehicle.id) === id);
    if (!target) return;

    setEditingVehicleId(id);
    setVehicleForm({
      name: target.name || '',
      model: target.model || '',
      year: String(target.yearRange || target.year || ''),
      price_per_day: String(target.price_per_day || ''),
      fuel_type: target.fuel_type || 'Petrol',
      transmission: target.transmission || 'Manual',
      seats: String(target.seats || ''),
      description: target.description || '',
      availability: Boolean(target.availability),
      image: (target.images && target.images[0]) || target.image || '',
      position: 'after',
      insertAfterId: getPreviousVehicleId(id),
    });
    setView('fleet');
  }

  async function handleDeleteVehicle(id: string) {
    if (!window.confirm('Remove this vehicle from the fleet?')) return;

    try {
      await vehicleApi.remove(id);
      await loadVehicles();
      setToast('Vehicle deleted successfully.');
    } catch {
      setToast('Unable to delete vehicle.');
    }
  }

  function handleEditPopup(popup?: Popup) {
    const selected = popup || currentPopup;
    if (selected) {
      const settings = popupToSettings(selected);
      setPopupForm(settings);
      setEditingPopupId(settings.id || null);
    } else {
      setPopupForm(getBranchPopupSettings());
      setEditingPopupId(null);
    }
    setShowPopupForm(true);
  }

  async function handlePopupSave(event: FormEvent) {
    event.preventDefault();

    if (!popupForm.title.trim()) {
      setToast('Popup title is required.');
      return;
    }

    try {
      const payload = {
        title: popupForm.title.trim(),
        subtitle: popupForm.subtitle.trim(),
        description: popupForm.description.trim(),
        image: popupForm.image || '',
        enabled: popupForm.enabled,
      };

      const saved = editingPopupId
        ? await popupApi.update(editingPopupId, payload)
        : await popupApi.create(payload);

      const settings = popupToSettings(saved);
      setBranchPopupSettings(settings);
      setPopupForm(settings);
      setEditingPopupId(settings.id || null);
      setShowPopupForm(false);
      await loadPopups();
      setToast('Popup saved successfully.');
    } catch {
      setToast('Unable to save popup.');
    }
  }

  async function handlePopupRemove(popup?: Popup) {
    const selected = popup || currentPopup;
    if (!selected) return;
    if (!window.confirm('Remove this popup from the website?')) return;

    try {
      if (selected.id || selected._id) {
        await popupApi.remove(String(selected.id || selected._id));
      }
      const disabledSettings = { ...popupToSettings(selected), enabled: false };
      setBranchPopupSettings(disabledSettings);
      setPopupForm(createEmptyPopupForm());
      setEditingPopupId(null);
      setShowPopupForm(false);
      await loadPopups();
      setToast('Popup removed successfully.');
    } catch {
      setToast('Unable to remove popup.');
    }
  }

  const sidebarItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutGrid },
    { id: 'fleet' as View, label: 'Fleet Management', icon: CarFront },
    { id: 'popup' as View, label: 'Popup Management', icon: Megaphone },
  ];

  const fleetSummary = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter(vehicle => vehicle.availability).length,
    unavailable: vehicles.filter(vehicle => !vehicle.availability).length,
  }), [vehicles]);

  const currentPopup = useMemo(() => {
    const savedPopup = popups.find(popup => popup.enabled) || popups[0];
    if (savedPopup) return savedPopup;

    const fallback = getBranchPopupSettings();
    return fallback.enabled ? settingsToPopup(fallback) : null;
  }, [popups, popupForm]);
  const positionVehicles = vehicles.filter(vehicle => String(vehicle.id) !== editingVehicleId);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0D0D0F] text-white">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm font-semibold text-[#D9D1B1] shadow-xl lg:hidden"
      >
        <LayoutGrid className="h-4 w-4" /> Menu
      </button>
      {sidebarOpen && <button aria-label="Close owner menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,18rem)] overflow-y-auto border-r border-white/10 bg-[#111315] p-5 shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:border-b-0 lg:p-6 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.3em] text-[#C7B894]">Owner</div>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Owner Dashboard</h2>
            <p className="mt-2 text-sm text-[#B8B3A0]">Manage popup visibility and fleet ordering from one simple dashboard.</p>
          </div>
          <nav className="space-y-2">
            <button onClick={() => setSidebarOpen(false)} className="mb-4 ml-auto flex rounded-full border border-white/10 p-2 text-[#D9D1B1] lg:hidden"><X className="h-4 w-4" /></button>
            {sidebarItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm transition ${view === item.id ? 'bg-white/10 text-white' : 'text-[#B8B3A0] hover:bg-white/5 hover:text-white'}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <button onClick={async () => { await signOut(); navigate('/login'); }} className="mt-4 flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm text-[#B8B3A0] hover:bg-white/5 hover:text-white">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:p-6 lg:pt-6">
          {toast && <div className="mb-4 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{toast}</div>}

          {view === 'dashboard' && (
            <section className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[32px] sm:p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">Overview</div>
                <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Welcome, {profile?.name || 'Owner'}</h3>
                <p className="mt-2 text-sm text-[#B8B3A0]">Operate popup content and fleet ordering from one simple dashboard.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-[#111315] p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#C7B894]">Fleet Total</div>
                  <div className="mt-3 text-3xl font-semibold">{fleetSummary.total}</div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-[#111315] p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#C7B894]">Available</div>
                  <div className="mt-3 text-3xl font-semibold">{fleetSummary.available}</div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-[#111315] p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#C7B894]">Inactive</div>
                  <div className="mt-3 text-3xl font-semibold">{fleetSummary.unavailable}</div>
                </div>
              </div>
            </section>
          )}

          {view === 'fleet' && (
            <section className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[32px] sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">Fleet Management</div>
                    <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Add, edit, and delete vehicles</h3>
                  </div>
                  <button onClick={resetVehicleForm} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-3xl bg-[#C7B894] px-4 py-2 text-sm font-semibold text-[#111315]">
                    {editingVehicleId ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingVehicleId ? 'Cancel Edit' : 'New Vehicle'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleVehicleSubmit} className="rounded-[24px] border border-white/10 bg-[#111315] p-4 sm:rounded-[32px] sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Vehicle Name</label>
                    <input value={vehicleForm.name} onChange={event => setVehicleForm(prev => ({ ...prev, name: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Model</label>
                    <input value={vehicleForm.model} onChange={event => setVehicleForm(prev => ({ ...prev, model: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Year</label>
                    <input value={vehicleForm.year} onChange={event => setVehicleForm(prev => ({ ...prev, year: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Price Per Day</label>
                    <input type="number" value={vehicleForm.price_per_day} onChange={event => setVehicleForm(prev => ({ ...prev, price_per_day: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Fuel</label>
                    <select value={vehicleForm.fuel_type} onChange={event => setVehicleForm(prev => ({ ...prev, fuel_type: event.target.value as Car['fuel_type'] }))} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none">
                      {vehicleFuelTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Transmission</label>
                    <select value={vehicleForm.transmission} onChange={event => setVehicleForm(prev => ({ ...prev, transmission: event.target.value as Car['transmission'] }))} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none">
                      {vehicleTransmissions.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Seats</label>
                    <input type="number" value={vehicleForm.seats} onChange={event => setVehicleForm(prev => ({ ...prev, seats: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Availability</label>
                    <select value={vehicleForm.availability ? 'available' : 'maintenance'} onChange={event => setVehicleForm(prev => ({ ...prev, availability: event.target.value === 'available' }))} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none">
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Vehicle Image</label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-[#D9D1B1]">
                      <UploadCloud className="h-4 w-4" />
                      {vehicleImageUploading ? 'Uploading...' : 'Upload image'}
                      <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={event => handleImageUpload(event, 'vehicle')} className="hidden" />
                    </label>
                    {vehicleForm.image && <img src={vehicleForm.image} alt="Vehicle preview" className="mt-3 h-32 w-full rounded-2xl object-cover" />}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Display Position</label>
                    <select value={vehicleForm.position} onChange={event => setVehicleForm(prev => ({ ...prev, position: event.target.value as PositionOption }))} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none">
                      <option value="after">After Vehicle</option>
                    </select>
                    <select value={vehicleForm.insertAfterId} onChange={event => setVehicleForm(prev => ({ ...prev, insertAfterId: event.target.value }))} className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none">
                      <option value="">Select vehicle</option>
                      {positionVehicles.map(vehicle => <option key={vehicle.id} value={String(vehicle.id)}>{getVehicleLabel(vehicle)}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Description</label>
                    <textarea value={vehicleForm.description} onChange={event => setVehicleForm(prev => ({ ...prev, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                  </div>
                </div>
                <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-[#C7B894] px-4 py-2 text-sm font-semibold text-[#111315]">
                  <CheckCircle2 className="h-4 w-4" />
                  {editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </form>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[32px] sm:p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">Current Fleet</div>
                <div className="mt-4 space-y-3">
                  {loading ? <div className="text-sm text-[#B8B3A0]">Loading fleet...</div> : vehicles.map(vehicle => (
                    <div key={vehicle.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#111315] p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{getVehicleLabel(vehicle)}</div>
                        <div className="text-sm text-[#B8B3A0]">{vehicle.model} / {vehicle.fuel_type} / {vehicle.transmission}</div>
                      </div>
                      <div className="grid gap-2 sm:flex">
                        <button onClick={() => handleEditVehicle(String(vehicle.id))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#D9D1B1]">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => handleDeleteVehicle(String(vehicle.id))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {view === 'popup' && (
            <section className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[32px] sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">Popup Management</div>
                    <h3 className="mt-2 text-xl font-semibold sm:text-2xl">Edit, remove, or add popup banners</h3>
                  </div>
                  <button onClick={resetPopupForm} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-3xl bg-[#C7B894] px-4 py-2 text-sm font-semibold text-[#111315]">
                    <Plus className="h-4 w-4" /> Add New Popup
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#111315] p-4 sm:rounded-[32px] sm:p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">Existing Popup</div>
                {currentPopup ? (
                  <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr]">
                    <div className="h-40 overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D0F] sm:h-44">
                      {currentPopup.image ? <img src={currentPopup.image} alt={currentPopup.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-[#B8B3A0]">No image</div>}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-semibold text-white">{currentPopup.title}</h4>
                        <span className={`rounded-full px-3 py-1 text-xs ${currentPopup.enabled ? 'bg-emerald-500/10 text-emerald-200' : 'bg-white/10 text-[#B8B3A0]'}`}>{currentPopup.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[#D9D1B1]">{currentPopup.subtitle}</div>
                      <p className="mt-3 text-sm leading-6 text-[#B8B3A0]">{currentPopup.description}</p>
                      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                        <button onClick={() => handleEditPopup(currentPopup)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#D9D1B1]">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => handlePopupRemove(currentPopup)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-white/10 bg-[#0D0D0F] p-5 text-sm text-[#B8B3A0]">No popup has been created yet.</div>
                )}
              </div>

              {showPopupForm && (
                <form onSubmit={handlePopupSave} className="rounded-[24px] border border-white/10 bg-[#111315] p-4 sm:rounded-[32px] sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.24em] text-[#C7B894]">{editingPopupId ? 'Edit Popup' : 'Add New Popup'}</div>
                      <h4 className="mt-2 text-xl font-semibold">{editingPopupId ? 'Update popup details' : 'Create popup banner'}</h4>
                    </div>
                    <button type="button" onClick={() => setShowPopupForm(false)} className="rounded-full border border-white/10 p-2 text-[#D9D1B1]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Popup Title</label>
                      <input value={popupForm.title} onChange={event => setPopupForm(prev => ({ ...prev, title: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Popup Subtitle</label>
                      <input value={popupForm.subtitle} onChange={event => setPopupForm(prev => ({ ...prev, subtitle: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Popup Description</label>
                      <textarea value={popupForm.description} onChange={event => setPopupForm(prev => ({ ...prev, description: event.target.value }))} rows={4} className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-white outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#C7B894]">Upload Popup Image</label>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0F] px-3 py-2 text-sm text-[#D9D1B1]">
                        <UploadCloud className="h-4 w-4" />
                        {popupImageUploading ? 'Uploading...' : 'Upload image'}
                        <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={event => handleImageUpload(event, 'popup')} className="hidden" />
                      </label>
                      {popupForm.image && <img src={popupForm.image} alt="Popup preview" className="mt-3 h-44 w-full rounded-2xl object-cover" />}
                    </div>
                    <div className="flex flex-col items-stretch gap-3 md:col-span-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <label className="flex items-center gap-2 text-sm text-[#D9D1B1]">
                        <input type="checkbox" checked={popupForm.enabled} onChange={event => setPopupForm(prev => ({ ...prev, enabled: event.target.checked }))} className="h-4 w-4 rounded border-white/10 bg-[#0D0D0F]" />
                        Enable Popup
                      </label>
                      <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-3xl bg-[#C7B894] px-4 py-2 text-sm font-semibold text-[#111315]">
                        <CheckCircle2 className="h-4 w-4" /> Save Popup
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}








