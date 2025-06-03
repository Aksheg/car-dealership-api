import jwt from 'jsonwebtoken';
import User from '@/models/User.model';
import Manager from '@/models/Manager.model';
import Customer from '@/models/Customer.model';

export const createTestUser = async (userData: any = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    role: 'customer',
    ...userData
  };

  const user = new User(defaultUser);
  await user.save();
  
  const savedUser = await User.findById(user._id);
  if (!savedUser) {
    throw new Error('User was not saved properly');
  }
  
  if (savedUser.role === 'customer') {
    const customer = new Customer({
      user: savedUser._id,
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
      },
      drivingLicense: 'TEST123',
      preferredBrands: [],
      purchaseHistory: [],
    });
    await customer.save();
  } else if (savedUser.role === 'manager') {
    const manager = new Manager({
      user: savedUser._id,
      employeeId: `EMP${Date.now()}`,
      department: 'Finance',
      salary: 50000,
      hireDate: new Date(),
      permissions: [],
    });
    await manager.save();
  }

  return savedUser;
};

export const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
};

export const createTestCustomer = async (email = 'customer@test.com') => {
  const user = await createTestUser({ email, role: 'customer' });
  const token = generateTestToken(user._id.toString());
  const customer = await Customer.findOne({ user: user._id });
  return { user, token, customer };
};

export const createTestManager = async (email = 'manager@test.com') => {
  const user = await createTestUser({ email, role: 'manager' });
  const token = generateTestToken(user._id.toString());
  const manager = await Manager.findOne({ user: user._id });
  return { user, token, manager };
};

export const createTestAdmin = async (email = 'admin@test.com') => {
  const user = await createTestUser({ email, role: 'admin' });
  const token = generateTestToken(user._id.toString());
  return { user, token };
};