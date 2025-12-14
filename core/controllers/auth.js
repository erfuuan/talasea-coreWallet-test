import responseBuilder from '../utils/responseBuilder.js';

export default class AuthController {
  constructor({ authService }) {
    if (!authService) {
      throw new Error('authService is required');
    }
    this.authService = authService;
  }

  async signup(req, res, next) {
    try {
      const { firstName, lastName, nationalCode, phone, password } =req.body;

      const result = await this.authService.signup({
        firstName,
        lastName,
        nationalCode,
        phone,
        password,
      });

      return responseBuilder.created(res, result);
    } catch (err) {
      return next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { phone, password } = req.body

      const result = await this.authService.login({ phone, password });

      return responseBuilder.success(res, result);
    } catch (err) {
      return next(err);
    }
  }
}
