import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data.json');

  if (req.method === 'POST') {
    const { ip, newLink } = req.body;

    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Verificar si la IP ya tiene un enlace asignado
      if (fileData.ipRecords[ip]) {
        return res.status(400).json({ message: 'La IP ya tiene un enlace asignado.' });
      }

      // Actualizar datos
      fileData.ipRecords[ip] = newLink;
      fileData.usedLinks.push(newLink);

      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

      return res.status(200).json({ message: 'Enlace asignado correctamente.', newLink });
    } catch (error) {
      return res.status(500).json({ message: 'Error al procesar la solicitud.', error });
    }
  }

  if (req.method === 'GET') {
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.status(200).json(fileData);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener los datos.', error });
    }
  }

  res.status(405).json({ message: 'Método no permitido.' });
}
