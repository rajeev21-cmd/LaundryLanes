'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import USERS from '@/data/users.json';
import STORES from '@/data/stores.json';
import SERVICES from '@/data/services.json';
import ORDERS_SEED from '@/data/orders.json';
import { nearestStore } from '@/lib/haversine';

const STORAGE_KEY = 'laundrylanes-poc-v1';

function offsetToDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function buildSeedOrders() {
  return ORDERS_SEED.map((o) => ({ ...o, pickupDate: offsetToDateStr(o.dayOffset) }));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount, seeding fresh mock data on first run.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setOrders(parsed.orders || buildSeedOrders());
        setCurrentUserId(parsed.currentUserId || null);
      } else {
        setOrders(buildSeedOrders());
      }
    } catch {
      setOrders(buildSeedOrders());
    }
    setIsHydrated(true);
  }, []);

  // Persist on every change, once hydrated.
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, currentUserId }));
  }, [orders, currentUserId, isHydrated]);

  const currentUser = useMemo(() => USERS.find((u) => u.id === currentUserId) || null, [currentUserId]);

  const login = useCallback((email, password) => {
    const match = USERS.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, []);

  const loginAsRole = useCallback((role) => {
    const match = USERS.find((u) => u.role === role);
    if (match) setCurrentUserId(match.id);
    return match || null;
  }, []);

  const logout = useCallback(() => setCurrentUserId(null), []);

  const resetDemoData = useCallback(() => {
    setOrders(buildSeedOrders());
  }, []);

  const bookPickup = useCallback(({ customerId, serviceId, pickupAddress, lat, lng, pickupDate, slot, notes }) => {
    const store = lat != null && lng != null ? nearestStore(STORES, lat, lng) : STORES[0];
    const order = {
      id: `ord-${Date.now()}`,
      customerId,
      serviceId,
      storeId: store.id,
      assignedWorkerId: null,
      pickupDate,
      slot,
      status: 'pending',
      pickupAddress,
      notes: notes || '',
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const assignWorker = useCallback((orderId, workerId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, assignedWorkerId: workerId, status: 'assigned' } : o))
    );
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }, []);

  const cancelOrder = useCallback((orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
  }, []);

  const value = {
    isHydrated,
    users: USERS,
    stores: STORES,
    services: SERVICES,
    orders,
    currentUser,
    today: todayStr(),
    login,
    loginAsRole,
    logout,
    resetDemoData,
    bookPickup,
    assignWorker,
    updateOrderStatus,
    cancelOrder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
