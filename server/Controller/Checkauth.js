class Checkauth {
  async Checkauthentiction(request, response) {
    console.log("Authenticated user:", request.user);

    return response.status(200).json({
      success: true,
      user: request.user,
    });
  }
}

export default new Checkauth();