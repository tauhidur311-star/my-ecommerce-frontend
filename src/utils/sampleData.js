// Sample data for testing order management and wishlist functionality
export const sampleOrders = [
  {
    id: "order_001",
    orderNumber: "ORD-2024-0001",
    customerId: "customer_001",
    customerInfo: {
      name: "Ahmed Hassan",
      email: "ahmed@email.com",
      phone: "01712345678"
    },
    items: [
      {
        productId: "product_001",
        name: "Premium Cotton Kurti",
        price: 1500,
        quantity: 2,
        size: "M",
        color: "Blue",
        image: "https://via.placeholder.com/300"
      }
    ],
    shippingAddress: {
      fullName: "Ahmed Hassan",
      phone: "01712345678",
      address: "House 123, Road 5, Dhanmondi",
      district: "Dhaka",
      division: "Dhaka",
      postalCode: "1205"
    },
    subtotal: 3000,
    shippingCost: 100,
    tax: 0,
    total: 3100,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "cash_on_delivery",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-15T10:30:00Z",
        note: "Order placed successfully"
      }
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "order_002",
    orderNumber: "ORD-2024-0002",
    customerId: "customer_002",
    customerInfo: {
      name: "Fatima Khan",
      email: "fatima@email.com",
      phone: "01887654321"
    },
    items: [
      {
        productId: "product_002",
        name: "Elegant Saree",
        price: 2500,
        quantity: 1,
        size: "One Size",
        color: "Red",
        image: "https://via.placeholder.com/300"
      },
      {
        productId: "product_003",
        name: "Designer Blouse",
        price: 800,
        quantity: 1,
        size: "S",
        color: "Gold",
        image: "https://via.placeholder.com/300"
      }
    ],
    shippingAddress: {
      fullName: "Fatima Khan",
      phone: "01887654321",
      address: "Flat 4B, Building 7, Gulshan 2",
      district: "Dhaka",
      division: "Dhaka",
      postalCode: "1212"
    },
    subtotal: 3300,
    shippingCost: 120,
    tax: 0,
    total: 3420,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "bkash",
    paymentDetails: {
      transactionId: "TXN123456789",
      paymentNumber: "01712345678",
      paymentDate: "2024-01-14T15:45:00Z"
    },
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-14T14:20:00Z",
        note: "Order placed successfully"
      },
      {
        status: "confirmed",
        timestamp: "2024-01-14T16:00:00Z",
        note: "Order confirmed by admin"
      },
      {
        status: "processing",
        timestamp: "2024-01-15T09:00:00Z",
        note: "Order is being processed"
      }
    ],
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "order_003",
    orderNumber: "ORD-2024-0003",
    customerId: "customer_003",
    customerInfo: {
      name: "Rahman Ali",
      email: "rahman@email.com",
      phone: "01612345678"
    },
    items: [
      {
        productId: "product_004",
        name: "Casual Panjabi",
        price: 1200,
        quantity: 3,
        size: "L",
        color: "White",
        image: "https://via.placeholder.com/300"
      }
    ],
    shippingAddress: {
      fullName: "Rahman Ali",
      phone: "01612345678",
      address: "Village Karimganj, Thana Savar",
      district: "Dhaka",
      division: "Dhaka",
      postalCode: "1340"
    },
    subtotal: 3600,
    shippingCost: 150,
    tax: 0,
    total: 3750,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "cash_on_delivery",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-12T11:15:00Z",
        note: "Order placed successfully"
      },
      {
        status: "confirmed",
        timestamp: "2024-01-12T14:30:00Z",
        note: "Order confirmed by admin"
      },
      {
        status: "processing",
        timestamp: "2024-01-13T10:00:00Z",
        note: "Order is being processed"
      },
      {
        status: "shipped",
        timestamp: "2024-01-13T16:30:00Z",
        note: "Order has been shipped"
      },
      {
        status: "delivered",
        timestamp: "2024-01-14T18:45:00Z",
        note: "Order has been delivered successfully"
      }
    ],
    actualDelivery: "2024-01-14T18:45:00Z",
    createdAt: "2024-01-12T11:15:00Z",
    updatedAt: "2024-01-14T18:45:00Z"
  }
];

export const sampleWishlist = [
  {
    productId: "product_005",
    addedAt: "2024-01-15T08:30:00Z"
  },
  {
    productId: "product_006", 
    addedAt: "2024-01-14T16:20:00Z"
  },
  {
    productId: "product_007",
    addedAt: "2024-01-13T12:10:00Z"
  }
];

// Function to initialize sample data
export const initializeSampleData = () => {
  // Initialize sample orders if none exist
  if (!localStorage.getItem('admin-orders')) {
    localStorage.setItem('admin-orders', JSON.stringify(sampleOrders));
  }
  
  if (!localStorage.getItem('user-orders')) {
    localStorage.setItem('user-orders', JSON.stringify(sampleOrders));
  }
  
  // Initialize sample wishlist if none exist
  if (!localStorage.getItem('user-wishlist')) {
    localStorage.setItem('user-wishlist', JSON.stringify(sampleWishlist));
  }
};

export default {
  sampleOrders,
  sampleWishlist,
  initializeSampleData
};