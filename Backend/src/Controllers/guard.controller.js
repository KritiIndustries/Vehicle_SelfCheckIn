
export const guardLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, 'This is my Secret Key', { expiresIn: '1h' });

    // Set user token in local storage
    localStorage.setItem('userToken', token);

    return res.status(200).json({ token });
});