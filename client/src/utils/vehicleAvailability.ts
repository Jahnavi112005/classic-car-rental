import { Car } from '../types';

export type VehicleStatus = 'available' | 'booked' | 'maintenance';

export function getVehicleStatus(vehicle: Car): VehicleStatus {
  if (vehicle.status) return vehicle.status;
  return vehicle.availability ? 'available' : 'booked';
}

export function isVehicleDeleted(vehicle: Car): boolean {
  return Boolean(vehicle.isDeleted);
}

export function getVehicleStatusLabel(vehicle: Car): string {
  const status = getVehicleStatus(vehicle);
  if (status === 'available') return 'Available';
  if (status === 'maintenance') return 'Maintenance';
  return 'Booked';
}

export function isVehicleBookable(vehicle: Car): boolean {
  return getVehicleStatus(vehicle) === 'available';
}

export function getVehicleActionButtonLabel(vehicle: Car): string {
  return isVehicleBookable(vehicle)
    ? 'Book Now'
    : getVehicleStatus(vehicle) === 'maintenance'
    ? 'Maintenance'
    : 'Not Available';
}

export function getVehicleActionButtonClass(vehicle: Car): string {
  return isVehicleBookable(vehicle)
    ? 'bg-brown text-white'
    : 'bg-white/10 text-[#7A7466] cursor-not-allowed';
}

export function getVehicleBadgeClass(vehicle: Car): string {
  const status = getVehicleStatus(vehicle);
  if (status === 'available') return 'bg-green-500 text-white';
  if (status === 'maintenance') return 'bg-orange-500 text-earth';
  return 'bg-red-500 text-white';
}

export function getVehicleAvailabilityDotClass(vehicle: Car): string {
  const status = getVehicleStatus(vehicle);
  if (status === 'available') return 'bg-green-500';
  if (status === 'maintenance') return 'bg-orange-500';
  return 'bg-red-500';
}
