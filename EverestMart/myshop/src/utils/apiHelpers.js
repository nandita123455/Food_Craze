// ✅ Helper to safely extract products array from API response
export const extractProducts = (response) => {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response?.products && Array.isArray(response.products)) {
    return response.products;
  }
  
  if (response?.data?.products && Array.isArray(response.data.products)) {
    return response.data.products;
  }
  
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};

// ✅ Helper for categories
export const extractCategories = (response) => {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response?.categories && Array.isArray(response.categories)) {
    return response.categories;
  }
  
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};
