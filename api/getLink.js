const links = [
  { url: 'https://backend.trak.codes/api/v0/pdf/single-case?source=GSheets&filename=pass.pdf&cextid=ad415fb4-aaa6-48eb-bef6-b959e647a6eb&inline=true', usedBy: null },
  { url: 'https://backend.trak.codes/api/v0/pdf/single-case?source=GSheets&filename=pass.pdf&cextid=b39924a8-7f0e-486e-8741-1a0d00025ec7&inline=true', usedBy: null },
  { url: 'https://backend.trak.codes/api/v0/pdf/single-case?source=GSheets&filename=pass.pdf&cextid=43466a81-37df-4a48-991d-148c982b385c&inline=true', usedBy: null },
];

export default function handler(req, res) {
  const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Busca un enlace asignado a esta IP
  const assignedLink = links.find(link => link.usedBy === userIP);

  if (assignedLink) {
    return res.status(200).json({ link: assignedLink.url });
  }

  // Encuentra un enlace no asignado
  const unusedLink = links.find(link => link.usedBy === null);

  if (unusedLink) {
    unusedLink.usedBy = userIP; // Marca el enlace como usado por esta IP
    return res.status(200).json({ link: unusedLink.url });
  }

  return res.status(404).json({ message: 'No more links available' });
}
