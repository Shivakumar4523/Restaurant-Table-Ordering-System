import User from "../models/User.js";

export async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "language"];
    const patch = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true }).select("-password");
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((address) => address._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    next(error);
  }
}
