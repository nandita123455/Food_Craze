export const getCurrentUserType = () => {
  const riderStr = localStorage.getItem('rider');
  const userStr = localStorage.getItem('user');

  if (riderStr) {
    try {
      const rider = JSON.parse(riderStr);
      return { type: 'rider', data: rider };
    } catch {
      return { type: 'guest', data: null };
    }
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // All logged-in users are treated as customers in the client app
      // Admin access is only available through the separate admin panel
      return { type: 'customer', data: user };
    } catch {
      return { type: 'guest', data: null };
    }
  }

  return { type: 'guest', data: null };
};

export const isCustomer = () => {
  const { type } = getCurrentUserType();
  return type === 'customer';
};

export const isRider = () => {
  const { type } = getCurrentUserType();
  return type === 'rider';
};

// NOTE: Admin access removed from client app for security
// Admin panel is only accessible through everestmart-admin
