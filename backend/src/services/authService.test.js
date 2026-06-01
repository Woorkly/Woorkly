jest.mock('../models/User', () => ({
  findByEmail: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('./authService');

describe('authService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('throws when user is not found', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'secret' })
      ).rejects.toThrow('Utilisateur non trouvé');
    });

    it('throws when password does not match', async () => {
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong-password' })
      ).rejects.toThrow('Mot de passe incorrect');
    });

    it('returns the user when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        nom: 'Test User',
        role: 'admin',
      };

      User.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await expect(
        authService.login({ email: 'test@example.com', password: 'secret' })
      ).resolves.toEqual(user);
    });
  });

  describe('generateToken', () => {
    it('generates a token with the expected payload', () => {
      jwt.sign.mockReturnValue('fake-token');

      const token = authService.generateToken({
        id: 7,
        email: 'test@example.com',
        nom: 'Test User',
        role: 'admin',
      });

      expect(token).toBe('fake-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 7,
          email: 'test@example.com',
          nom: 'Test User',
          role: 'admin',
        },
        'test-secret',
        { expiresIn: '7d' }
      );
    });
  });
});
