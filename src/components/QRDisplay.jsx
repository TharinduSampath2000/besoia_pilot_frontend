import { QRCodeCanvas } from 'qrcode.react';
import { Spinner } from './ui.jsx';
import { useI18n } from '../i18n.jsx';

export default function QRDisplay({ value, name }) {
  const { t } = useI18n();
  return <div className="flex flex-col items-center">
    <div className="rounded-3xl bg-cream p-2 shadow-[0_20px_40px_-20px_rgba(27,38,44,0.45)] ring-1 ring-ink/10" role="img" aria-label={t('qr.label', { name: name || t('qr.you') })}>
      {value
        ? <QRCodeCanvas className="block" style={{ width: 'min(260px, 70vw)', height: 'auto', aspectRatio: '1 / 1' }} value={value} size={440} bgColor="#FFFFFF" fgColor="#1B262C" marginSize={4} level="L" />
        : <div className="grid place-items-center text-ink/40" style={{ width: 'min(260px, 70vw)', aspectRatio: '1 / 1' }}><Spinner className="h-7 w-7" /></div>}
    </div>
  </div>;
}
