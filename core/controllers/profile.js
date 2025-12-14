import responseBuilder from '../utils/responseBuilder.js';

export default class ProfileController {
  constructor({ profileService }) {
    if (!profileService) {
      throw new Error('profileService is required');
    }
    this.profileService = profileService;
  }

  async getProfile(req, res, next) {
    try {
      const profile = await this.profileService.getProfile(req.user.id);
      return responseBuilder.success(res, profile);
    } catch (err) {
      return next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updateData = req.body;

      const updatedProfile = await this.profileService.updateProfile(
        req.user.id,
        updateData
      );

      return responseBuilder.success(res, updatedProfile);
    } catch (err) {
      return next(err);
    }
  }
}
