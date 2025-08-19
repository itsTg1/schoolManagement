const pool = require("../config/db");

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const toNumber = (v) => (v === 0 || v === "0" ? 0 : Number(v));
const isValidLat = (n) => Number.isFinite(n) && n >= -90 && n <= 90;
const isValidLng = (n) => Number.isFinite(n) && n >= -180 && n <= 180;

// Add School
exports.addSchool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body || {};

    if (!isNonEmptyString(name))
      return res.status(400).json({ error: "name is required" });
    if (!isNonEmptyString(address))
      return res.status(400).json({ error: "address is required" });

    const lat = toNumber(latitude);
    const lng = toNumber(longitude);

    if (!isValidLat(lat))
      return res
        .status(400)
        .json({ error: "latitude must be between -90 and 90" });
    if (!isValidLng(lng))
      return res
        .status(400)
        .json({ error: "longitude must be between -180 and 180" });

    const sql = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
    const params = [name.trim(), address.trim(), lat, lng];

    const [result] = await pool.execute(sql, params);
    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
    });
  } catch (err) {
    console.error("addSchool error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// List Schools
exports.listSchools = async (req, res) => {
  try {
    const lat = toNumber(req.query.lat);
    const lng = toNumber(req.query.lng);

    if (!isValidLat(lat))
      return res.status(400).json({ error: "lat must be between -90 and 90" });
    if (!isValidLng(lng))
      return res
        .status(400)
        .json({ error: "lng must be between -180 and 180" });

    const sql = `
SELECT id, name, address, latitude, longitude,
(6371 * ACOS(
COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
SIN(RADIANS(?)) * SIN(RADIANS(latitude))
)) AS distance_km
FROM schools
ORDER BY distance_km ASC`;

    const [rows] = await pool.execute(sql, [lat, lng, lat]);

    res.json({
      userLocation: { lat, lng },
      count: rows.length,
      schools: rows.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        distance_km:
          r.distance_km !== null ? Number(r.distance_km.toFixed(3)) : null,
      })),
    });
  } catch (err) {
    console.error("listSchools error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
