import { QRCodeCanvas } from 'qrcode.react';

export default function QRDisplay({ sessionId, name }) {
  return <div className="flex flex-col items-center">
    <div className="rounded-3xl bg-cream p-2 shadow-[0_20px_40px_-20px_rgba(27,38,44,0.45)] ring-1 ring-ink/10" role="img" aria-label={`QR code for ${name || 'you'}`}>
      <QRCodeCanvas className="block" style={{ width: 'min(220px, 60vw)', height: 'auto', aspectRatio: '1 / 1' }} value={sessionId || ''} size={440} bgColor="#FFFFFF" fgColor="#1B262C" marginSize={4} level="M" />
    </div>
  </div>;
}
