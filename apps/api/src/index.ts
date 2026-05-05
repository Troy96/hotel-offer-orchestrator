import express from "express";
import hotelRoutes from "./routes/hotelRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// mount routes
app.use("/api", hotelRoutes);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});