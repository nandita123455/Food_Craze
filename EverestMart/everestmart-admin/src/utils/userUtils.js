export const getCurrentUserType = () => {
  const riderStr = localStorage.getItem('rider');
  const userStr = localStorage.getItem('user');
  
  if (riderStr) {
    try {
      const rider = JSON.parse(riderStr);
      return { type: 'rider', data: rider };
    } catch (e) {
      return { type: 'guest', data: null };
    }
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.isAdmin) {
        return { type: 'admin', data: user };
      }
      return { type: 'customer', data: user };
    } catch (e) {
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

export const isAdmin = () => {
  const { type } = getCurrentUserType();
  return type === 'admin';
};
