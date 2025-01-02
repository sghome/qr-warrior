const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema de MongoDB
const linkSchema = new Schema({
  url: String,
  used: Boolean,
});

const ipRecordSchema = new Schema({
  ip: String,
  link: { type: Schema.Types.ObjectId, ref: 'Link' },
});

const Link = mongoose.model('Link', linkSchema);
const IpRecord = mongoose.model('IpRecord', ipRecordSchema);

// Conexión a MongoDB
const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await connectDb();

    // Obtener todos los enlaces no usados
    const links = await Link.find({ used: false });

    if (links.length === 0) {
      return res.status(404).json({ message: 'No hay más enlaces disponibles.' });
    }

    // Devuelve el primer enlace disponible
    const link = links[0];
    return res.status(200).json({ link: link.url });
  }

  if (req.method === 'POST') {
    const { ip, linkUrl } = req.body;

    await connectDb();

    // Verificar si la IP ya tiene un enlace asignado
    const existingRecord = await IpRecord.findOne({ ip });

    if (existingRecord) {
      return res.status(400).json({ message: 'La IP ya tiene un enlace asignado.' });
    }

    // Buscar el enlace por URL
    const link = await Link.findOne({ url: linkUrl });

    if (!link) {
      return res.status(404).json({ message: 'Enlace no encontrado.' });
    }

    // Marcar el enlace como usado
    link.used = true;
    await link.save();

    // Registrar el enlace asignado a la IP
    const ipRecord = new IpRecord({ ip, link: link._id });
    await ipRecord.save();

    return res.status(200).json({ message: 'Enlace asignado con éxito.' });
  }
}
